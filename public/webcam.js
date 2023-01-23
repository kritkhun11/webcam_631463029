//  1.import socket io
//  2.get ข้อมูล ของ video-grid
//  3.สร้าง element video ขึ้นมา
//  4. querySelector คือการเรียกใช้ css เป็นบางจุด
//  5. myVideo.muted = true == ตั้งค่าตั้งต้นวีดีโอเป็นปิดไว้ก่อน

const Server = require("socket.io");


const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
myVideo.muted = true;

// ตั้งค่าปุ่ม backBtn/showChat

backBtn.addEventListener("click", () => {
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector(".header__back").style.display = "none";
});

showChat.addEventListener("click", () => {
  document.querySelector(".main__right").style.display = "flex";
  document.querySelector(".main__right").style.flex = "1";
  document.querySelector(".main__left").style.display = "none";
  document.querySelector(".header__back").style.display = "block";
});

// prompt เก็บชื่อผู้ใช้
const user = prompt("Enter your name");

  //  สร้าง peer object
  //  กำหนดค่าต่างๆรวมทั้ง port ให้ตรงกับ *server.js* // ที่ path /peerjs
  //  รวมทั้ง config เข้า url: ต่างๆ 
var peer = new Peer({
  host: '127.0.0.1',
  port: 3002,
  path: '/peerjs',
  config: {
    'iceServers': [
      { url: 'stun:stun01.sipphone.com' },
      { url: 'stun:stun.ekiga.net' },
      { url: 'stun:stunserver.org' },
      { url: 'stun:stun.softjoys.com' },
      { url: 'stun:stun.voiparound.com' },
      { url: 'stun:stun.voipbuster.com' },
      { url: 'stun:stun.voipstunt.com' },
      { url: 'stun:stun.voxgratia.org' },
      { url: 'stun:stun.xten.com' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credentials: 'openrelayproject'
      }
      // {
      //   url: 'turn:192.158.29.39:3478?transport=tcp',
      //   credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      //   username: '28224511:1379330808'
      // }
    ]
  },
  // debug 3 คือ เอาทั้งหมด 
  debug: 3
});
  // ถาม ยูเซอร์ ว่าจะเปิดกล้องและเสียงไหม ถ้าผ่านถึงจะไปขั้นต่อไป
let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  // เมื่อยอมรับ มีเซิร์ฟเวอร์คอยรับฟังกิจกรรมห้องเข้าร่วม ต่อไปจะทำการตั้งค่าตั้งค่า script.js 
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      console.log('someone call me');
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });
    // เชื่อมต่อยูเซอร์
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });
  // เชื่อต่อยูเซอร์ใหม่+โชว์ยูเซอร์
const connectToNewUser = (userId, stream) => {
  console.log('I call someone' + userId);
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};
  // เปิดห้องพร้อมทั้งระบุหัวห้อง
peer.on("open", (id) => {
  console.log('my id is' + id);
  socket.emit("join-room", ROOM_ID, id, user);
});
  //  เริ่มสตรีม
const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.append(video);
  });
};
    // ส่วนของ แชท 
let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

  // เช็คว่ามีข้อความไหม หรือ ข้อความไม่เท่ากับ0 จะแสดงข้อความออกมา 
  // socket.emit เป็นไลบรารีที่ขับเคลื่อนด้วยเหตุการณ์สำหรับเว็บแอปพลิเคชันแบบเรียลไทม์ ช่วยให้สามารถสื่อสารแบบสองทิศทางแบบเรียลไทม์ระหว่างเว็บไคลเอ็นต์และเซิร์ฟเวอร์
send.addEventListener("click", (e) => {
  if (text.value.length !== 0) {
    socket. ("message", text.value);
    text.value = "";
  }
});

text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
  //ปิดเปิดไมค์ 
muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});
//  ปิดกล้อง
stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});
  // เชิญบุคคลอื่นเข้า ห้อง
inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
});
    // โชว์ข้อความแชท
    //  ${userName === user ? "me" แสดงชื่อว่า me 
socket.on("createMessage", (message, userName) => {
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName
    }</span> </b>
        <span>${message}</span>
    </div>`;
});