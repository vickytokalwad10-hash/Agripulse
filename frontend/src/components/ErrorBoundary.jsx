import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AgriPulse AI UI Error Caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    localStorage.removeItem('agripulse_cache_v1');
    window.location.href = window.location.origin + window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4 antialiased text-[#1c1917]">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-floating border border-[#e7e5e4] text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#14532d] flex items-center justify-center text-3xl mx-auto border border-emerald-200">
              🌱
            </div>
            
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-[#1c1917] font-editorial">
                AgriPulse AI • कृषि सेवा
              </h2>
              <p className="text-xs text-[#78716c]">
                The application encountered an unexpected display issue. Your data and account remain safe.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#e7e5e4] text-left text-[11px] font-mono text-rose-800 break-words max-h-28 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 bg-[#14532d] hover:bg-[#052e16] text-white text-xs font-extrabold rounded-xl shadow-xs transition"
              >
                🔄 Reload App (पुनः लोड करें)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
