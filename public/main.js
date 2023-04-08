const socket = io()
const clientsTotal = document.getElementById('client-total')
const messageContainer = document.getElementById('message-container')
const nameInput = document.getElementById('name-input')
const messageForm = document.getElementById('message-form')
const messageInput = document.getElementById('message-input')

const messageTone = new Audio('/message-tone.mp3')
const key = "sed-lyf-of-munmun"

messageForm.addEventListener('submit', (e) => {
  e.preventDefault()
  sendMessage()
})

socket.on('clients-total', (data) => {
  clientsTotal.innerText = `Total Clients: ${data}`
})

function sendMessage() {
  if (messageInput.value === '') return
  
  //encrypting message
  let start = Date.now()
  const ciphertext = CryptoJS.AES.encrypt( messageInput.value, key, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
  let end = Date.now()

  const data = {
    name: nameInput.value,
    message: ciphertext,
    dateTime: new Date(),
    enctime: end-start
  }
  socket.emit('message', data)
  addMessageToUI(true, data)
  
  messageInput.value = ''
}

socket.on('chat-message', (data) => {
  messageTone.play()
  addMessageToUI(false, data)
})

function addMessageToUI(isOwnMessage, data) {
  clearFeedback()

  //decrypting message
  const decrypted = CryptoJS.AES.decrypt(data.message, key, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString(CryptoJS.enc.Utf8);

  const element = `
      <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
          <p class="message">
            ${decrypted}
            <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
          </p>
        </li>
        `

  messageContainer.innerHTML += element
  scrollToBottom()
}

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight)
}

messageInput.addEventListener('focus', (e) => {
  socket.emit('feedback', {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  })
})

messageInput.addEventListener('keypress', (e) => {
  socket.emit('feedback', {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  })
})
messageInput.addEventListener('blur', (e) => {
  socket.emit('feedback', {
    feedback: '',
  })
})

socket.on('feedback', (data) => {
  clearFeedback()
  const element = `
        <li class="message-feedback">
          <p class="feedback" id="feedback">${data.feedback}</p>
        </li>
  `
  messageContainer.innerHTML += element
})

function clearFeedback() {
  document.querySelectorAll('li.message-feedback').forEach((element) => {
    element.parentNode.removeChild(element)
  })
}