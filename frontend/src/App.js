import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotificationPopup from './components/NotificationPopup';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BookList from './pages/BookList';
import RequestForm from './pages/RequestForm';
import MyBooks from './pages/MyBooks';
import Profile from './pages/Profile';
import ICard from './pages/ICard';
import Penalties from './pages/Penalties';
import Students from './pages/Students';
import Requests from './pages/Requests';
import AdminPenalties from './pages/AdminPenalties';
import AdminBooks from './pages/AdminBooks';
import Home from './pages/Home';
import Help from './pages/Help';
import Notifications from './pages/Notifications';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        <NotificationPopup />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={
            <div className="App">
              <Sidebar />
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/student" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
                  <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
                  <Route path="/books/:category" element={<PrivateRoute><BookList /></PrivateRoute>} />
                  <Route path="/request/:bookId" element={<PrivateRoute role="student"><RequestForm /></PrivateRoute>} />
                  <Route path="/my-books" element={<PrivateRoute role="student"><MyBooks /></PrivateRoute>} />
                  <Route path="/icard" element={<PrivateRoute role="student"><ICard /></PrivateRoute>} />
                  <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                  <Route path="/penalties" element={<PrivateRoute role="student"><Penalties /></PrivateRoute>} />
                  <Route path="/students" element={<PrivateRoute role="admin"><Students /></PrivateRoute>} />
                  <Route path="/requests" element={<PrivateRoute role="admin"><Requests /></PrivateRoute>} />
                  <Route path="/admin-penalties" element={<PrivateRoute role="admin"><AdminPenalties /></PrivateRoute>} />
                  <Route path="/admin-books" element={<PrivateRoute role="admin"><AdminBooks /></PrivateRoute>} />
                  <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
                  <Route path="/help" element={<PrivateRoute><Help /></PrivateRoute>} />
                </Routes>
              </main>
              <Footer />
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
