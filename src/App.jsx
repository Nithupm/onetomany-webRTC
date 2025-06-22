import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Broadcaster from './components/broadcaster/Broadcaster';
import Viewer from './components/viewer/Viewer';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  text-align: center;
  background-color: #f9f9f9;
  min-height: 100vh;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  color: #222;
  margin-bottom: 1.5rem;
`;

const Button = styled(Link)`
  padding: 0.75rem 1.5rem;
  margin: 0.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 1rem;
  text-decoration: none;
  display: inline-block;
  transition: background 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

function Home() {
  return (
    <Container>
      <Title>New Meeting</Title>
      <Button to="/broadcaster">Start as Broadcaster</Button>
      <Button to="/viewer">Join as Viewer</Button>
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
