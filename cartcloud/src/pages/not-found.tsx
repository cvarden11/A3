import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '4rem', margin: '0', color: '#333' }}>404</h1>
      <h2 style={{ fontSize: '2rem', margin: '1rem 0', color: '#666' }}>Page Not Found</h2>
      <p style={{ fontSize: '1.2rem', margin: '1rem 0', color: '#888' }}>
        The page you're looking for doesn't exist.
      </p>
      <Link 
        to="/login" 
        style={{ 
          padding: '0.8rem 1.5rem', 
          backgroundColor: '#007bff', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: '4px',
          marginTop: '2rem'
        }}
      >
        Go to Login
      </Link>
    </div>
  );
}

export default NotFound; 