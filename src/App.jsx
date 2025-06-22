import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Broadcaster from './components/broadcaster/Broadcaster';
import Viewer from './components/viewer/Viewer';
import styled, { keyframes } from 'styled-components';
import { FiVideo, FiUser } from 'react-icons/fi';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #eef2f3, #ffffff);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Card = styled.div`
  background-color: white;
  padding: 3rem 4rem;
  border-radius: 1rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #1a1a1a;
  margin-bottom: 2rem;
`;

const Button = styled(Link)`
  padding: 1rem 2rem;
  margin: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  box-shadow: 0 4px 10px rgba(0, 123, 255, 0.15);
  transition: all 0.3s ease;

  &:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
  }
`;

function Home() {
  return (
    <Container>
      <Card>
        <Title> Start Your Meeting</Title>
        <Button to="/broadcaster"><FiVideo size={20} /> Start as Broadcaster</Button>
        <Button to="/viewer"><FiUser size={20} /> Join as Viewer</Button>
      </Card>
    </Container>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/broadcaster" element={<Broadcaster />} />
        <Route path="/viewer" element={<Viewer />} />
      </Routes>
    </Router>
  );
}

export default App;
