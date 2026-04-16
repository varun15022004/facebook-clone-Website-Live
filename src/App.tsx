import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Stories from './pages/Stories';
import StoryView from './pages/StoryView';
import Notes from './pages/Notes';
import NoteView from './pages/NoteView';
import CreateNote from './pages/CreateNote';
import EditNote from './pages/EditNote';
import Reels from './pages/Reels';
import ReelView from './pages/ReelView';
import CreateReel from './pages/CreateReel';
import Friends from './pages/Friends';
import FriendRequests from './pages/FriendRequests';
import Notifications from './pages/Notifications';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/profile/:id" element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            } />
            <Route path="/stories" element={
              <PrivateRoute>
                <Stories />
              </PrivateRoute>
            } />
            <Route path="/stories/:id" element={
              <PrivateRoute>
                <StoryView />
              </PrivateRoute>
            } />
            <Route path="/notes" element={
              <PrivateRoute>
                <Notes />
              </PrivateRoute>
            } />
            <Route path="/notes/:id" element={
              <PrivateRoute>
                <NoteView />
              </PrivateRoute>
            } />
            <Route path="/notes/create" element={
              <PrivateRoute>
                <CreateNote />
              </PrivateRoute>
            } />
            <Route path="/notes/edit/:id" element={
              <PrivateRoute>
                <EditNote />
              </PrivateRoute>
            } />
            <Route path="/reels" element={
              <PrivateRoute>
                <Reels />
              </PrivateRoute>
            } />
            <Route path="/reels/:id" element={
              <PrivateRoute>
                <ReelView />
              </PrivateRoute>
            } />
            <Route path="/reels/create" element={
              <PrivateRoute>
                <CreateReel />
              </PrivateRoute>
            } />
            <Route path="/friends" element={
              <PrivateRoute>
                <Friends />
              </PrivateRoute>
            } />
            <Route path="/friend-requests" element={
              <PrivateRoute>
                <FriendRequests />
              </PrivateRoute>
            } />
            <Route path="/notifications" element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;