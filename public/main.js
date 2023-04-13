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
  
/*encrypting message using DES

  let start = Date.now()
  const ciphertext = CryptoJS.DES.encrypt( messageInput.value, key, {
    mode: CryptoJS.mode.CTR,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
  let end = Date.now()
  let algoUsed = "DES"
*/

/*encrypting message using TripleDES

  let start = Date.now()
  const ciphertext = CryptoJS.TripleDES.encrypt( messageInput.value, key, {
    mode: CryptoJS.mode.CTR,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
  let end = Date.now()
  let algoUsed = "TripleDES"
*/

/*encrypting message using AES
*/
  let start = Date.now()
  const ciphertext = CryptoJS.AES.encrypt( messageInput.value, key, {
    mode: CryptoJS.mode.CTR,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
  let end = Date.now()
  let algoUsed = "AES"


  /*encrypting message using RC4
  
  let start = Date.now()
  const ciphertext = CryptoJS.RC4.encrypt( messageInput.value, key, {
    mode: CryptoJS.mode.CTR,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
  let end = Date.now()
  let algoUsed = "RC4"
  */

  let file_bytes = messageInput.value.length;

  let file_size = "";

  if(file_bytes <= 1)
  {
    file_size = "Tiny (1 Byte)"
  }
  else if(file_bytes <= 25)
  {
    file_size = "Small (<=25 Bytes)"
  }
  else if(file_bytes <= 150)
  {
    file_size = "Medium (<=150 Bytes)"
  }
  else if(file_bytes <= 500)
  {
    file_size = "Large (<=500 Bytes)"
  }
  else file_size = "Huge (>500 Bytes)"

  const data = {
    name: nameInput.value,
    message: ciphertext,
    dateTime: new Date(),
    fileSize: file_size,
    algo: algoUsed,
    enctime: end-start + "ms",
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

/*decrypting ciphertext using DES

  const decrypted = CryptoJS.DES.decrypt(data.message, key, {
    mode: CryptoJS.mode.CTR,
    padding: CryptoJS.pad.Pkcs7,
  }).toString(CryptoJS.enc.Utf8);
*/

/*decrypting ciphertext using TripleDES

  const decrypted = CryptoJS.TripleDES.decrypt(data.message, key, {
    mode: CryptoJS.mode.CTR,
    padding: CryptoJS.pad.Pkcs7,
  }).toString(CryptoJS.enc.Utf8);
*/

/*decrypting ciphertext using AES
*/
  const decrypted = CryptoJS.AES.decrypt(data.message, key, {
    mode: CryptoJS.mode.CTR,
    padding: CryptoJS.pad.Pkcs7,
  }).toString(CryptoJS.enc.Utf8);
  

  /*decrypting ciphertext using RC4
  
  const decrypted = CryptoJS.RC4.decrypt(data.message, key, {
    mode: CryptoJS.mode.CTR,
    padding: CryptoJS.pad.Pkcs7,
  }).toString(CryptoJS.enc.Utf8);
*/
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