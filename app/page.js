'use client'
import { Box, Button, Stack, TextField } from "@mui/material";
import { auth, db } from './api/chat/firebase';

import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from "firebase/firestore";

import { useEffect, useState } from "react";
export default function Home() {
  // const [userId, setUserId] = useState('');
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hi I'm Abdullahi Nur, ask anything about me!`
  }])  //messages is an array of objects

  const [message, setMessage] = useState('')  //for textbox
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Generate or retrieve unique identifier
  // useEffect(() => {
  //   let userId = localStorage.getItem('userId');
  //   if (!userId) {
  //     // Generate a random userId (e.g., using UUID or a simple random string)
  //     userId = crypto.randomUUID(); // or use another method to generate a unique ID
  //     localStorage.setItem('userId', userId);
  //   }
  //   setUserId(userId);
  // }, []);

  // useEffect(() => {
  //   if (userId) {
  //     fetch(`/api/chat?userId=${userId}`)
  //           .then(res => res.json())
  //           .then(data => setMessages(data.messages));
  //   }
  // }, [userId]);
  useEffect(() => {
    // When user logs in, fetch their previous conversation
    if (user) {
      fetchConversation(user.email);
    }
  }, [user]);

  const fetchConversation = async (email) => {
    const conversationRef = doc(db, "conversations", email);
    const docSnap = await getDoc(conversationRef);
    if (docSnap.exists()) {
      setMessages(docSnap.data().conversation);
    }
  };
  const saveConversation = async (email, conversation) => {
    const conversationRef = doc(db, "conversations", email);
    await setDoc(conversationRef, { conversation });
  };

  const handleLogin = async () => {
    console.log('Login button clicked'); // Log when the login button is clicked
    try {
      console.log('Attempting to sign in...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign-in successful!');
      setUser(userCredential.user);
      console.log('User signed in:', userCredential.user);      
    } catch (error) {
      console.error("Error logging in", error);
    }
  };

  const handleLogout = async () => {
     // Save the conversation before logging out
    if (user) {
      await saveConversation(user.email, [...messages]);
    }
    await signOut(auth);
    setUser(null);
    setMessages([{
      role: 'assistant',
      content: `Hi I'm Abdullahi Nur, ask anything about me!`
    }]);
  };

  const handleSignin = async () => {
    console.log('Sign Up button clicked');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Account created successfully!');
      setUser(userCredential.user);
    } catch (createError) {
      console.error('Error creating account', createError);
    }
  };

  const sendMessage = async()=>{
    setMessage('') //makes the label 'message' dissapear when you send a message
    setMessages((messages)=> [
      ...messages,
      {role: 'user', content:message},
      {role: 'assistant', content:""}
    ])
    const response =await fetch('/api/chat', {
      method: "POST",
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...messages, {role: 'user', content: message}]) //*****Converts the messages array (with the new user message appended) to a JSON string to be sent in the request body. ex. { "role": "user", "content": "How do I reset my password?" }
    }).then(async (res)=>{                    //Handles the response of the fetch request.
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let result = ''
      return reader.read().then(function proccessText({done,value}){  // Reads chunks of data from the stream and processes them. Reads a chunk from the response body.
        if(done){
          return result
        }
        const text = decoder.decode(value || new Int8Array(), {stream:true}) //if there is no value we make new int8array so it doesnt break, so it either decodes the value, and if therr is no value it decodes an empty string
        setMessages((messages)=>{
          //console.log(messages)
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0,messages.length -1)
          return[
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text, 
            },
          ]
        })
        return reader.read().then(proccessText)
      })
    })

    if (user) {
      await saveConversation(user.email, [...messages, { role: 'user', content: message }]);
    }
  }

  return (
    <Box width='100vw' height='100vh' display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
      {!user ? (
        <Stack direction='column' spacing={2}>
          <TextField
            label="Email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Stack direction='row' spacing={2}>
            <Button variant="contained" onClick={handleLogin}>Login</Button>
            <Button variant="contained" onClick={handleSignin}>Sign Up</Button>
          </Stack>
        </Stack>
      ) : (
        <Stack
          direction='column'
          width='600px'
          height='700px'
          border='1px solid black'
          p={2}
          spacing={2}
        >
          <Button variant="contained" onClick={handleLogout}>Logout</Button>
          <Stack
            direction='column' spacing={2} flexGrow={1} overflow='auto' maxHeight='100%'
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display='flex'
                justifyContent={
                  message.role === 'assistant' ? 'flex-start' : 'flex-end'
                }
              >
                <Box bgcolor={
                  message.role === 'assistant'
                    ? 'primary.main'
                    : "secondary.main"
                }
                  color="white"
                  borderRadius={16}
                  p={3}
                >
                  {message.content}
                </Box></Box>
            ))}
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
            >
              Send
            </Button>
          </Stack>
        </Stack>
      )}
    </Box>
  );
}
