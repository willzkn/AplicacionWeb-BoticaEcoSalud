import React, { useState, useRef, useEffect } from 'react';
import '../../styles/chatbot.css';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: '¡Hola! Soy tu asistente virtual de EcoSalud. ¿En qué puedo ayudarte hoy?',
      options: [
        'Tengo síntomas',
        'Información de contacto',
        'Ubicación y horarios'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Base de conocimiento del chatbot
  const knowledgeBase = {
    sintomas: {
      'dolor de cabeza': {
        response: 'Para dolor de cabeza, te recomendamos:',
        products: [
          '• Paracetamol 500mg - Desde S/.5.00',
          '• Ibuprofeno 400mg - Desde S/.8.00',
          '• Aspirina 500mg - Desde S/.6.50'
        ],
        advice: 'Recuerda descansar en un lugar tranquilo y mantenerte hidratado. Si el dolor persiste por más de 3 días, consulta a un médico.'
      },
      'dolor de estomago': {
        response: 'Para dolor de estómago, te sugerimos:',
        products: [
          '• Omeprazol 20mg - Desde S/.12.00',
          '• Ranitidina 150mg - Desde S/.9.00',
          '• Sales de rehidratación - Desde S/.3.50'
        ],
        advice: 'Evita alimentos irritantes y come ligero. Si hay vómitos o diarrea persistente, consulta a un médico.'
      },
      'fiebre': {
        response: 'Para controlar la fiebre, recomendamos:',
        products: [
          '• Paracetamol 500mg - Desde S/.5.00',
          '• Ibuprofeno 400mg - Desde S/.8.00',
          '• Paracetamol jarabe (niños) - Desde S/.15.00'
        ],
        advice: 'Mantente hidratado y descansa. Si la fiebre supera 39°C o dura más de 3 días, busca atención médica.'
      },
      'gripe': {
        response: 'Para síntomas de gripe, te ofrecemos:',
        products: [
          '• Antigripales (Tabcin, Desenfriol) - Desde S/.10.00',
          '• Vitamina C 1000mg - Desde S/.18.00',
          '• Paracetamol 500mg - Desde S/.5.00'
        ],
        advice: 'Descansa, bebe líquidos abundantes y evita cambios bruscos de temperatura. Consulta si los síntomas empeoran.'
      },
      'tos': {
        response: 'Para aliviar la tos, tenemos:',
        products: [
          '• Jarabe para la tos - Desde S/.12.00',
          '• Pastillas para la garganta - Desde S/.5.00',
          '• Expectorantes - Desde S/.15.00'
        ],
        advice: 'Bebe líquidos calientes y evita irritantes como el humo. Si la tos persiste más de una semana, consulta a un médico.'
      },
      'alergia': {
        response: 'Para síntomas de alergia, recomendamos:',
        products: [
          '• Loratadina 10mg - Desde S/.8.00',
          '• Cetirizina 10mg - Desde S/.9.00',
          '• Antihistamínicos - Desde S/.12.00'
        ],
        advice: 'Identifica y evita el alérgeno si es posible. Si hay dificultad para respirar, busca atención médica inmediata.'
      }
    },
    contacto: {
      telefono: '📞 Teléfono: (01) 234-5678',
      whatsapp: '📱 WhatsApp: +51 987 654 321',
      email: '📧 Email: contacto@mibotica.com',
      horario: '🕐 Horario de atención telefónica: Lunes a Sábado de 8:00 AM - 8:00 PM'
    },
    ubicacion: {
      direccion: '📍 Dirección: Av. Principal 123, Lima, Perú',
      horario: '🕐 Horario de atención: Lunes a Sábado de 8:00 AM - 9:00 PM, Domingos de 9:00 AM - 6:00 PM',
      mapa: '🗺️ Encuéntranos cerca del Centro Comercial Plaza Norte'
    }
  };

  const handleOptionClick = (option) => {
    // Agregar mensaje del usuario
    const userMessage = { role: 'user', text: option };
    setMessages(prev => [...prev, userMessage]);

    // Generar respuesta del bot
    setTimeout(() => {
      let botResponse = { role: 'bot', text: '', options: [] };

      if (option === 'Tengo síntomas') {
        botResponse.text = '¿Qué síntoma tienes? Selecciona una opción:';
        botResponse.options = [
          'Dolor de cabeza',
          'Dolor de estómago',
          'Fiebre',
          'Gripe',
          'Tos',
          'Alergia',
          'Volver al menú principal'
        ];
      } else if (option === 'Información de contacto') {
        botResponse.text = `Aquí está nuestra información de contacto:\n\n${knowledgeBase.contacto.telefono}\n${knowledgeBase.contacto.whatsapp}\n${knowledgeBase.contacto.email}\n\n${knowledgeBase.contacto.horario}`;
        botResponse.options = ['Volver al menú principal'];
      } else if (option === 'Ubicación y horarios') {
        botResponse.text = `Encuéntranos en:\n\n${knowledgeBase.ubicacion.direccion}\n${knowledgeBase.ubicacion.horario}\n${knowledgeBase.ubicacion.mapa}`;
        botResponse.options = ['Volver al menú principal'];
      } else if (option === 'Volver al menú principal') {
        botResponse.text = '¿En qué más puedo ayudarte?';
        botResponse.options = [
          'Tengo síntomas',
          'Información de contacto',
          'Ubicación y horarios'
        ];
      } else {
        // Buscar en la base de conocimiento de síntomas
        const symptomKey = option.toLowerCase();
        const symptomData = knowledgeBase.sintomas[symptomKey];

        if (symptomData) {
          botResponse.text = `${symptomData.response}\n\n${symptomData.products.join('\n')}\n\n💡 Consejo: ${symptomData.advice}`;
          botResponse.options = [
            'Ver más síntomas',
            'Información de contacto',
            'Volver al menú principal'
          ];
        } else {
          botResponse.text = 'Lo siento, no tengo información específica sobre ese síntoma. ¿Puedo ayudarte con algo más?';
          botResponse.options = [
            'Tengo síntomas',
            'Información de contacto',
            'Volver al menú principal'
          ];
        }
      }

      if (option === 'Ver más síntomas') {
        botResponse.text = '¿Qué otro síntoma tienes?';
        botResponse.options = [
          'Dolor de cabeza',
          'Dolor de estómago',
          'Fiebre',
          'Gripe',
          'Tos',
          'Alergia',
          'Volver al menú principal'
        ];
      }

      setMessages(prev => [...prev, botResponse]);
    }, 500);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const userMessage = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Respuesta automática para texto libre
    setTimeout(() => {
      const botResponse = {
        role: 'bot',
        text: 'Por favor, selecciona una de las opciones disponibles para poder ayudarte mejor. Si necesitas algo específico, puedes contactarnos directamente.',
        options: [
          'Tengo síntomas',
          'Información de contacto',
          'Ubicación y horarios'
        ]
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      {/* Botón flotante */}
      {!isOpen && (
        <button
          className="chatbot-button"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir chat"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}

      {/* Ventana del chat */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">🏥</div>
              <div>
                <h3>Asistente MiBotica</h3>
                <span className="chatbot-status">En línea</span>
              </div>
            </div>
            <button
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar chat"
            >
              ✕
            </button>
          </div>

          {/* Mensajes */}
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message message-${message.role}`}>
                <div className="message-content">
                  <p style={{ whiteSpace: 'pre-line' }}>{message.text}</p>
                  {message.options && message.options.length > 0 && (
                    <div className="message-options">
                      {message.options.map((option, optIndex) => (
                        <button
                          key={optIndex}
                          className="option-button"
                          onClick={() => handleOptionClick(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={handleSendMessage} aria-label="Enviar mensaje">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
