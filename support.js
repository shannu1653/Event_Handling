/* support.js
   - Handles Send Click, AI auto-reply typing, validations, and form clear.
   - Place this file and include it at the bottom of support.html
*/

/* --------- Elements --------- */
const sendBtn = document.getElementById("supportSendBtn");
const nameInput = document.getElementById("supportName");
const emailInput = document.getElementById("supportEmail");
const typeInput = document.getElementById("supportType");
const messageInput = document.getElementById("supportMessage");
const replyBox = document.getElementById("supportReply");

/* Helper: simple email validation */
function isValidEmail(email){
  return /\S+@\S+\.\S+/.test(email);
}

/* Prepare a reply text based on issue type (easy to extend) */
function buildAutoReply(name, type){
  const base = `Hi ${name}, 👋\n\n`;
  let body = "";

  switch(type){
    case "Login Problem":
      body = "Try resetting your password using 'Forgot password'. If that doesn't work, reply back and we will reset it manually.";
      break;
    case "Ticket Not Received":
      body = "Check your spam folder first. If not found, we will resend the ticket to your email within 5 minutes.";
      break;
    case "Payment Issue":
      body = "Payments usually settle in 2–5 minutes. If funds were deducted, send a screenshot and we'll investigate immediately.";
      break;
    case "Event Creation Help":
      body = "We can help you set up the event. Share the event details and we will give step-by-step guidance.";
      break;
    default:
      body = "Thanks — we've received your message and our support team will reach out soon.";
  }

  // extra helpful tip
  return base + body + "\n\n— Support Team";
}

/* Create a tiny typing animation element (dots) */
function createTypingDots(){
  const el = document.createElement("span");
  el.className = "replyTyping";
  el.innerHTML = '<span></span><span></span><span></span>';
  return el;
}

/* Show reply with typing animation then type final message */
function showReplyWithTyping(fullText){
  // clear previous content
  replyBox.innerHTML = "";

  // show container
  replyBox.classList.add("show");

  // show typing dots first
  const dots = createTypingDots();
  replyBox.appendChild(dots);

  // After short delay, replace dots with typed text
  const typingDelay = 900; // ms before showing message (feel free to adjust)
  setTimeout(() => {
    replyBox.removeChild(dots);

    // Type effect (character by character)
    let i = 0;
    replyBox.textContent = ""; // start empty

    const speed = 18; // ms per char
    const typer = setInterval(() => {
      replyBox.textContent += fullText.charAt(i);
      i++;
      if(i >= fullText.length){
        clearInterval(typer);
      }
    }, speed);

  }, typingDelay);
}

/* On send click */
sendBtn.addEventListener("click", () => {
  const name = nameInput.value.trim() || "there";
  const email = emailInput.value.trim();
  const type = typeInput.value;
  const message = messageInput.value.trim();

  // Basic validation
  if(!name || !email || !message){
    alert("Please fill Name, Email and Message.");
    return;
  }
  if(!isValidEmail(email)){
    alert("Please enter a valid email address.");
    return;
  }

  // Build reply
  const replyText = buildAutoReply(name, type);

  // Show reply with typing animation
  showReplyWithTyping(replyText);

  // Optionally: here you can send the form to server via fetch() if integrated.

  // Clear the form AFTER reply is fully typed so the user sees it
  // We'll wait the typing animation to finish: estimate = typingDelay + (chars * speed) + small buffer
  const estimatedTime = 900 + (replyText.length * 18) + 300;
  setTimeout(() => {
    // Clear fields
    nameInput.value = "";
    emailInput.value = "";
    typeInput.selectedIndex = 0;
    messageInput.value = "";

    // Focus back to name (optional)
    nameInput.focus();

    // keep reply visible (do not auto-hide)
  }, estimatedTime);
});
