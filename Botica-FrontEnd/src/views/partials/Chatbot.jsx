import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useNavigate } from 'react-router-dom';
import ProductoService from '../../services/ProductoService';
import { productosMock } from '../../data/productosMock';

const apiKey = process.env.REACT_APP_GOOGLE_GENAI_API_KEY;

const createGenerativeAIClient = () => {
  if (!apiKey) {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

const MAX_HISTORY_ITEMS = 10;

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: '¡Hola! Soy tu asistente virtual de EcoSalud. Puedo responder preguntas sobre nuestros servicios y recomendar productos de la botica. ¿En qué puedo ayudarte hoy?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const generativeAI = useMemo(() => createGenerativeAIClient(), []);

  const model = useMemo(() => {
    if (!generativeAI) {
      return null;
    }
    return generativeAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: {
        role: 'system',
        parts: [
          {
            text:
              'Eres el asistente virtual de Botica EcoSalud, una farmacia peruana. Responde en español y prioriza recomendaciones basadas en el catálogo proporcionado. Si un usuario menciona síntomas comunes (ej. dolor de cabeza, dolor de estómago, fiebre, resfrío, tos, alergia), puedes recomendar productos del catálogo con nombre, precio y enlace. Sé breve, útil y cordial. Si la consulta es médica avanzada o grave, se empatico y recomiendale algun producto que se relacione a su malestar.'
          }
        ]
      }
    });
  }, [generativeAI]);

  useEffect(() => {
    window.navigateToProduct = (event, path) => {
      event.preventDefault();
      navigate(path);
    };
    return () => {
      delete window.navigateToProduct;
    };
  }, [navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadProducts = useCallback(async () => {
    try {
      const productosBackend = await ProductoService.obtenerProductosPublicos();
      const productosTransformados = Array.isArray(productosBackend)
        ? productosBackend.map(ProductoService.transformarProducto)
        : [];
      setProducts(productosTransformados);
      setProductsError('');
    } catch (err) {
      console.error('Error al cargar productos para el chatbot:', err);
      setProducts([]);
      setProductsError('No pude cargar la lista de productos.');
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const findRelevantProducts = useCallback(
    (prompt) => {
      const source = productosMock;

      const normalizedPrompt = prompt.toLowerCase();
      const tokens = normalizedPrompt
        .split(/[^\p{L}\p{N}]+/u)
        .map((token) => token.trim())
        .filter((token) => token.length > 2);

      if (!tokens.length) {
        return [];
      }

      const scored = source
        .map((product) => {
          const searchable = [
            product.name,
            product.description,
            product.presentation,
            product?.categoria?.descripcion,
            product?.categoria?.nombre,
            ...(product.keywords || [])
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          const score = tokens.reduce((acc, token) => {
            if (searchable.includes(token)) {
              return acc + 1;
            }
            return acc;
          }, 0);

          return { product, score };
        })
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ product }) => product);

      return scored;
    },
    []
  );

  const formatProductContext = useCallback((matchedProducts) => {
    if (!matchedProducts.length) {
      return 'No se identificaron productos del catálogo relacionados directamente con la consulta.';
    }

    const lines = matchedProducts.map((product) => {
      const price = product.price || (product.precio ? `S/.${product.precio}` : 'Precio no disponible');
      return `• ${product.name} (${price}) – [Ver producto](/producto/${product.id})`;
    });

    return `Productos sugeridos del catálogo:\n${lines.join('\n')}`;
  }, []);

   const buildChatHistory = useCallback((conversation) => {
    const truncated = conversation
      .filter((message) => message.role === 'user' || message.role === 'model')
      .slice(-MAX_HISTORY_ITEMS);

    const sanitized = [...truncated];
    while (sanitized.length > 0 && sanitized[0].role !== 'user') {
      sanitized.shift();
    }

    return sanitized.map((message) => ({
      role: message.role,
      parts: [{ text: message.text }]
    }));
  }, []);

  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      return;
    }

    if (!model) {
      setError('Falta la clave REACT_APP_GOOGLE_GENAI_API_KEY. Configúrala antes de usar el chatbot.');
      return;
    }

    addMessage({ role: 'user', text: trimmed });
    setInputValue('');
    setLoading(true);
    setError('');

    try {
      const relevantProducts = findRelevantProducts(trimmed);
      const productContext = formatProductContext(relevantProducts);
      const augmentedPrompt = [
        'Instrucciones adicionales:',
        '- Usa un tono cordial y profesional.',
        '- Si sugieres productos, incluye menciones específicas y CTA breves.',
        productsError ? `- Nota: ${productsError}` : '',
        '',
        'Consulta del cliente:',
        trimmed,
        '',
        productContext
      ]
        .filter(Boolean)
        .join('\n');

      const history = buildChatHistory([...messages, { role: 'user', text: augmentedPrompt }]);
      const chatSession = model.startChat({ history });
      const result = await chatSession.sendMessage(augmentedPrompt);
      const text = result?.response?.text?.();

      if (!text) {
        addMessage({
          role: 'model',
          text: 'No pude generar una respuesta en este momento. Por favor, inténtalo nuevamente más tarde.'
        });
      } else {
        addMessage({ role: 'model', text });
      }
    } catch (err) {
      console.error('Error generando contenido con Google GenAI:', err);
      const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
      setError(`Ocurrió un error al comunicarse con Google GenAI: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="chatbot-genai"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        fontFamily: 'Arial, sans-serif'
      }}
    >
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#1E4099',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(30, 64, 153, 0.3)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <path d="M8 10h.01M12 10h.01M16 10h.01"/>
          </svg>
        </button>
      )}

      {isOpen && (
        <div
          style={{
            width: '380px',
            height: isMinimized ? '60px' : '600px',
            background: 'linear-gradient(to bottom, #ffffff, #fafbfc)',
            borderRadius: '16px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: '1px solid rgba(30, 64, 153, 0.1)'
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #1E4099 0%, #2E5BC7 100%)',
              color: 'white',
              padding: '18px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(30, 64, 153, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '50%',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  <path d="M8 10h.01M12 10h.01M16 10h.01"/>
                </svg>
              </div>
              <div>
                <span style={{ fontWeight: '600', fontSize: '16px', display: 'block' }}>Asistente EcoSalud</span>
                <span style={{ fontSize: '12px', opacity: 0.9, display: 'block' }}>Experto en productos farmacéuticos</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                {isMinimized ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3v5a2 2 0 0 1-2 2H3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                  </svg>
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div
                style={{
                  flex: 1,
                  padding: '20px',
                  overflowY: 'auto',
                  background: 'linear-gradient(to bottom, #f8f9fa, #ffffff)',
                  '&::-webkit-scrollbar': {
                    width: '6px'
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#c1c1c1',
                    borderRadius: '3px'
                  }
                }}
              >
                {messages.map((message, index) => (
                  <div
                    key={index}
                    style={{
                      alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      marginBottom: '12px'
                    }}
                  >
                    <div
                      style={{
                        background: message.role === 'user' 
                          ? 'linear-gradient(145deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)' 
                          : 'linear-gradient(145deg, #f5f5f5 0%, #e0e0e0 50%, #d0d0d0 100%)',
                        color: message.role === 'user' ? '#1565c0' : '#424242',
                        borderRadius: message.role === 'user' ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
                        padding: '14px 18px',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        boxShadow: message.role === 'user' 
                          ? 'inset 0 1px 2px rgba(255, 255, 255, 0.6), inset 0 -1px 2px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(33, 150, 243, 0.15)' 
                          : 'inset 0 1px 2px rgba(255, 255, 255, 0.5), inset 0 -1px 2px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.08)',
                        border: message.role === 'user' 
                          ? '1px solid rgba(255, 255, 255, 0.4)' 
                          : '1px solid rgba(255, 255, 255, 0.3)',
                        position: 'relative',
                        wordBreak: 'break-word',
                        backdropFilter: 'blur(5px)',
                        WebkitBackdropFilter: 'blur(5px)',
                        transform: 'translateZ(0)',
                        willChange: 'transform'
                      }}
                    >
                      <div
                        dangerouslySetInnerHTML={{ 
                          __html: message.text.replace(/\[([^\]]+)\]\((\/producto\/\d+)\)/g, 
                            '<a href="$2" style="color: #1E4099; text-decoration: underline; cursor: pointer; font-weight: 500;" onclick="window.navigateToProduct(event, \'$2\')">$1</a>') 
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div style={{ padding: '16px', borderTop: '1px solid #e0e0e0' }}>
                {error && (
                  <div style={{ color: '#d32f2f', fontSize: '12px', marginBottom: '8px' }}>{error}</div>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <textarea
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Escribe tu consulta sobre productos o síntomas..."
                    rows={2}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e0e0e0',
                      resize: 'none',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      background: '#fafafa'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1E4099';
                      e.target.style.boxShadow = '0 0 0 3px rgba(30, 64, 153, 0.1)';
                      e.target.style.background = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = '#fafafa';
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={loading}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: 'none',
                      background: loading 
                        ? 'linear-gradient(135deg, #9cabd6 0%, #b8c9e6 100%)' 
                        : 'linear-gradient(135deg, #1E4099 0%, #2E5BC7 100%)',
                      color: '#fff',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      boxShadow: loading ? 'none' : '0 4px 12px rgba(30, 64, 153, 0.25)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '48px'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(30, 64, 153, 0.35)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(30, 64, 153, 0.25)';
                      }
                    }}
                  >
                    {loading ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;
