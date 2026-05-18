import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { chatApi } from '../api/chat';
import type { ChatRoom, Message } from '../types';
import Avatar from '../components/common/Avatar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate } from '../utils';
import toast from 'react-hot-toast';

const ChatPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { socket } = useSocket();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      chatApi.getRooms().then(res => setRooms(res.data.data || [])).catch(() => {}).finally(() => setRoomsLoading(false));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_message', (msg: Message) => {
      if (activeRoom && msg.room_id === activeRoom.id) {
        setMessages(prev => [...prev, msg]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    });
    return () => { socket.off('new_message'); };
  }, [socket, activeRoom]);

  const selectRoom = async (room: ChatRoom) => {
    setActiveRoom(room);
    setMessagesLoading(true);
    try {
      const res = await chatApi.getMessages(room.id);
      setMessages(res.data.data || []);
      socket?.emit('join_room', { roomId: room.id });
      setTimeout(() => messagesEndRef.current?.scrollIntoView(), 100);
    } catch { toast.error('Failed to load messages'); }
    finally { setMessagesLoading(false); }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom || isSending) return;
    const content = newMessage.trim();
    setNewMessage('');
    setIsSending(true);
    try {
      socket?.emit('send_message', { roomId: activeRoom.id, content });
    } catch { toast.error('Failed to send message'); }
    finally { setIsSending(false); }
  };

  const createGroupRoom = async () => {
    const name = prompt('Enter group chat name:');
    if (!name) return;
    try {
      const res = await chatApi.createRoom({ name, type: 'group', memberIds: [] });
      const newRoom: ChatRoom = { id: res.data.data.id, name, type: 'group', member_count: 1, members: [{ id: user!.id, name: user!.name }] };
      setRooms(prev => [newRoom, ...prev]);
      toast.success('Group chat created!');
    } catch { toast.error('Failed to create chat'); }
  };

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="card overflow-hidden" style={{ height: 'calc(100vh - 180px)', minHeight: '500px' }}>
        <div className="flex h-full">
          {/* Rooms sidebar */}
          <div className="w-72 border-r border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">💬 Messages</h2>
              <button onClick={createGroupRoom} className="text-blue-600 text-xs hover:text-blue-800 font-medium">+ New</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {roomsLoading ? <LoadingSpinner size="sm" /> : rooms.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-400">
                  No conversations yet. Create one to start chatting!
                </div>
              ) : rooms.map(room => {
                const otherMembers = room.members?.filter(m => m.id !== user?.id) || [];
                const displayName = room.name || otherMembers[0]?.name || 'Chat';
                return (
                  <button key={room.id} onClick={() => selectRoom(room)}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left ${activeRoom?.id === room.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''}`}>
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                      {room.type === 'group' ? '👥' : displayName[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{displayName}</p>
                      {room.last_message && <p className="text-xs text-gray-400 truncate">{room.last_message}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            {activeRoom ? (
              <>
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">
                    {activeRoom.name || activeRoom.members?.find(m => m.id !== user?.id)?.name || 'Chat'}
                  </h3>
                  <p className="text-xs text-gray-400">{activeRoom.member_count} member{activeRoom.member_count !== 1 ? 's' : ''}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messagesLoading ? <LoadingSpinner size="sm" /> :
                    messages.length === 0 ? (
                      <div className="text-center text-sm text-gray-400 py-8">No messages yet. Say hi! 👋</div>
                    ) : messages.map(msg => {
                      const isMine = msg.sender_id === user?.id;
                      return (
                        <div key={msg.id} className={`flex gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isMine && <Avatar name={msg.sender_name} url={msg.sender_avatar} size="xs" />}
                          <div className={`max-w-xs lg:max-w-md ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                            {!isMine && <span className="text-xs text-gray-500 pl-1">{msg.sender_name}</span>}
                            <div className={`px-4 py-2 rounded-2xl text-sm ${isMine ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-900 rounded-tl-sm'}`}>
                              {msg.content}
                            </div>
                            <span className="text-xs text-gray-400 px-1">{formatDate(msg.created_at)}</span>
                          </div>
                        </div>
                      );
                    })
                  }
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 flex gap-2">
                  <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..." className="input flex-1" autoFocus />
                  <button type="submit" disabled={!newMessage.trim() || isSending} className="btn-primary px-5">
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a conversation</h3>
                  <p className="text-gray-500 text-sm">Select a chat room or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
