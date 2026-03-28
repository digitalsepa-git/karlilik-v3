import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { DataProvider } from './context/DataContext.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { this.setState({ errorInfo }); }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red', padding: 20, backgroundColor: '#fdd', fontFamily: 'monospace' }}>
        <h2>React Runtime Error:</h2>
        <pre>{this.state.error && this.state.error.stack}</pre>
        <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
      </div>;
    }
    return this.props.children;
  }
}

console.log('Main: Mounting root...');
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <DataProvider>
        <App />
      </DataProvider>
    </ErrorBoundary>
  </StrictMode>,
)
