import './App.css';
import firebase from "firebase";
import firebaseapp from "./firebase";
import {useAuthState} from "react-firebase-hooks/auth";
import {useCollectionData} from "react-firebase-hooks/firestore";
import React,{useState,useRef} from "react";


const auth = firebaseapp.auth();
const db = firebaseapp.firestore();

function App() {
  const[user] = useAuthState(auth);
  return (
    <div className="App">
      {console.log(user)}

      {user ? <ChatApp/> : <div className="Signin"> <SignIn user={user} /> </div>}
    </div>

  );
}

function SignIn({user}) {

  function googleSignIn(){
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider);
      
  }
  return (
      <div>
          <button className="signinbtn" onClick={googleSignIn}>Sign In For a Chat!</button>
          
      </div>
  )
}

function SignOut(){
  return(
    auth.currentUser && 
    <button className="signout" onClick={()=> auth.signOut()}>Sign Out</button>
  )
}

function ChatApp() {
  return (
      <div>
          <Chatroom />
      </div>
  )
}

function Chatroom(){
  const dummy = useRef();

  const messages = db.collection("messages");
  const query = messages.orderBy("Createdat");
  const [msg] = useCollectionData(query,{idField: "id"});
  const [formvalue, setFormvalue] = useState("");
  
  const sendMessage = async (e) =>{
    e.preventDefault();
    const {uid,photoURL,displayName} = auth.currentUser;
    messages.add({
      text: formvalue,
      username: displayName,
      Createdat: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL

    })
    setFormvalue("");
    //dummy.current.scrollIntoView({ behavior: "smooth", block: "end" });
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return(<>
  <div className="chatwrapper">
    <div className="chatroom">
      <div className="header">
        <SignOut/>
      </div>
      <div className="messages">
        {msg && msg.map((message)=> 
        <Chatmessage key={message.id} message={message} />)}
        <div id="dummy" ref={dummy}></div>
      </div>
    </div>
    <form className="form" >
        <div className="inputdiv">
          <input placeholder="Type a message" className="text_input" value={formvalue} type="textarea" onChange={(e)=>setFormvalue(e.target.value)}/>
          <button className="sendButton" onClick={sendMessage} type="submit">Send</button>
        </div>
    </form>
  </div>
  </>)
}

function Chatmessage(props){
  const {photoURL,username,uid,text} = props.message;
  const messageState = uid === auth.currentUser.uid ? "sent" : "received";
  return<>
    <div className={`messagebox${messageState}`}>
      <img src={photoURL}/>
      <div>
        <h3>{username}</h3>
        <p>{text}</p>
      </div>
    </div>
  </>
}

export default App;