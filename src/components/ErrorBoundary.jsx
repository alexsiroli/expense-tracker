import React from 'react';
import { AlertTriangle, RefreshCw, Mail, Home, Copy, Check } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isReloading: false,
      copied: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log dell'errore per debugging
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ isReloading: true });
    window.location.reload();
  };

  handleContactDeveloper = () => {
    const errorDetails = `
Errore: ${this.state.error?.message || 'Errore sconosciuto'}
Stack: ${this.state.error?.stack || 'N/A'}
Component: ${this.state.errorInfo?.componentStack || 'N/A'}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
    `.trim();

    const mailtoLink = `mailto:alex.siroli@studio.unibo.it?subject=Errore App Expense Tracker&body=${encodeURIComponent(errorDetails)}`;
    window.open(mailtoLink);
  };

  handleCopyError = async () => {
    const errorDetails = `
Errore: ${this.state.error?.message || 'Errore sconosciuto'}
Stack: ${this.state.error?.stack || 'N/A'}
Component: ${this.state.errorInfo?.componentStack || 'N/A'}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorDetails);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      // Fallback per browser che non supportano clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = errorDetails;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            {/* Icona Errore */}
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Ops! Qualcosa è andato storto
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Si è verificato un errore inaspettato. Non preoccuparti, possiamo risolverlo insieme.
              </p>
            </div>

            {/* Dettagli Errore */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-left">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Dettagli dell'errore:
                </h3>
                <button
                  onClick={this.handleCopyError}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm ${
                    this.state.copied 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                  }`}
                  title="Copia dettagli errore"
                >
                  {this.state.copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copiato!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copia
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono break-all">
                {this.state.error?.message || 'Errore sconosciuto'}
              </p>
            </div>

            {/* Azioni */}
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                disabled={this.state.isReloading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {this.state.isReloading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Ricaricando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Ricarica l'app
                  </>
                )}
              </button>

              <button
                onClick={this.handleContactDeveloper}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Contatta lo sviluppatore
              </button>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                Ti prego, se hai trovato un bug clicca qui e mi daresti una grande mano! È tutto automatico 😊
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 