import { sendToGroq } from "../../lib/groqApi";

export default function createAIAssistantUI() {
	const aiContainer = document.createElement("div");
	aiContainer.style.height = "100%";
	aiContainer.style.width = "100%";
	aiContainer.style.display = "flex";
	aiContainer.style.flexDirection = "column";
	aiContainer.style.backgroundColor = "var(--bg-color)";
	aiContainer.style.color = "var(--text-color)";
	aiContainer.style.overflow = "hidden";
	aiContainer.style.fontFamily = "sans-serif";

	// HTML Structure
	aiContainer.innerHTML = `
		<style>
			/* Welcome & Chat Container */
			.ai-chat-container { flex: 1; display: flex; flex-direction: column; padding: 20px; overflow-y: auto; scroll-behavior: smooth; }
			.ai-welcome-content { margin: auto; width: 100%; max-width: 400px; display: flex; flex-direction: column; align-items: center; transition: opacity 0.3s; }
			.ai-title { font-size: 22px; font-weight: 500; margin-bottom: 6px; letter-spacing: 0.5px; color: #ffffff; text-align: center; }
			.ai-subtitle { font-size: 13px; color: #aaaaaa; margin-bottom: 40px; text-align: center; }
			
			/* Guide Tree Section */
			.ai-guide-container { text-align: left; width: 100%; }
			.ai-guide-title { font-size: 18px; font-weight: 500; margin-bottom: 12px; color: #ffffff; }
			.ai-guide-tree { font-family: monospace; color: #aaaaaa; line-height: 2; font-size: 14px; }
			.ai-guide-tree a { color: #d8b4fe; text-decoration: none; border-bottom: 1px dotted #d8b4fe; }
			.tree-details summary { cursor: pointer; outline: none; user-select: none; color: #ffffff; list-style: none; }
			.tree-details summary::-webkit-details-marker { display: none; }
			.tree-content { padding-left: 28px; margin-top: 10px; font-family: sans-serif; font-size: 13px; color: #cccccc; line-height: 1.6; margin-bottom: 20px; }
			.tree-content pre { background: rgba(0, 0, 0, 0.4); padding: 10px; border-radius: 6px; font-family: monospace; color: #a78bfa; margin: 8px 0 16px 0; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: anywhere; border: 1px solid rgba(255, 255, 255, 0.05); }
			.tree-content code { background: rgba(0, 0, 0, 0.4); padding: 2px 5px; border-radius: 4px; font-family: monospace; color: #a78bfa; }
			.important-note { border-left: 3px solid #facc15; padding: 8px 12px; margin-top: 12px; background: rgba(250, 204, 21, 0.1); color: #fef08a; border-radius: 0 4px 4px 0; }
			
			/* Chat Bubbles (New Additions) */
			.chat-msg-wrapper { display: flex; flex-direction: column; width: 100%; margin-bottom: 16px; }
			.chat-msg { max-width: 85%; padding: 12px 16px; border-radius: 12px; font-size: 14px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; }
			.chat-msg.user { align-self: flex-end; background: #3b82f6; color: #fff; border-bottom-right-radius: 4px; }
			.chat-msg.bot { align-self: flex-start; background: rgba(255,255,255,0.05); color: var(--text-color); border-bottom-left-radius: 4px; border: 1px solid rgba(255,255,255,0.05); }
			.chat-loading { align-self: flex-start; font-size: 12px; color: #aaaaaa; font-style: italic; margin-bottom: 16px; display: none; }

			/* Bottom Input Area */
			.ai-input-wrapper { margin: 16px; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 4px; background: rgba(255, 255, 255, 0.02); display: flex; flex-direction: column; flex-shrink: 0; }
			.ai-textarea { width: 100%; background: transparent; border: none; color: #ffffff; padding: 14px 16px; font-size: 14px; resize: none; outline: none; min-height: 50px; max-height: 150px; font-family: inherit; }
			.ai-textarea::placeholder { color: #888888; }
			.ai-input-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 8px 16px 12px 16px; }
			.ai-toolbar-left, .ai-toolbar-right { display: flex; align-items: center; gap: 12px; }
			.ai-icon-btn { background: none; border: none; color: #ffffff; font-size: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0; line-height: 1; transition: opacity 0.2s; }
			.ai-icon-btn:active { opacity: 0.5; }
			.ai-dropdown { background: transparent; color: #ffffff; border: none; outline: none; font-size: 14px; cursor: pointer; appearance: none; -webkit-appearance: none; font-weight: 500; }
		</style>

		<div class="ai-chat-container" id="ai-chat-container">
			<div class="ai-welcome-content" id="ai-welcome-screen">
				<div class="ai-title">Welcome to Acode Assistant</div>
				<div class="ai-subtitle">Describe What You Want To Build</div>
				
				<div class="ai-guide-container">
					<div class="ai-guide-title">How To Start</div>
					<div class="ai-guide-tree">
						<div>├── <a href="https://f-droid.org/packages/com.termux" target="_blank">Termux From F-Droid.</a></div>
						<div>├── <a href="https://acode.app/plugin/bajrangcoder.acodex" target="_blank">AcodeX From Acode Plugins.</a></div>
						<details class="tree-details">
							<summary>└── Connect AcodeX With Termux.</summary>
							<div class="tree-content">
								<ol style="padding-left: 16px; margin: 0;">
									<li style="margin-bottom: 12px;">Open Termux</li>
									<li style="margin-bottom: 12px;">
										Install the Server in Termux...
										<pre>curl -sL https://raw.githubusercontent.com/bajrangCoder/acode-plugin-acodex/main/installServer.sh | bash</pre>
									</li>
								</ol>
								<div class="important-note">
									<strong>[!IMPORTANT]</strong> After installing TigerVNC, make sure to set a password by running the <code>vncserver</code> command the first time.
								</div>
							</div>
						</details>
					</div>
				</div>
			</div>
			<div class="chat-loading" id="ai-loading-indicator">Assistant is thinking...</div>
		</div>

		<div class="ai-input-wrapper">
			<textarea class="ai-textarea" id="ai-input" rows="1" placeholder="Describe what you want to build..."></textarea>
			
			<div class="ai-input-toolbar">
				<div class="ai-toolbar-left">
					<button class="ai-icon-btn">+</button>
					<select class="ai-dropdown" id="ai-model-select">
						<option value="groq-llama3">Llama 3 (Groq)</option>
					</select>
				</div>
				<div class="ai-toolbar-right">
					<select class="ai-dropdown" id="ai-mode-select">
						<option value="plan" selected>Plan</option>
						<option value="execute">Execute</option>
					</select>
					<button class="ai-icon-btn" id="ai-send-btn" style="font-size: 18px;">►</button>
				</div>
			</div>
		</div>
	`;

	// JS Logic Start
	setTimeout(() => {
		const textarea = aiContainer.querySelector('#ai-input');
		const sendBtn = aiContainer.querySelector('#ai-send-btn');
		const chatContainer = aiContainer.querySelector('#ai-chat-container');
		const welcomeScreen = aiContainer.querySelector('#ai-welcome-screen');
		const loadingIndicator = aiContainer.querySelector('#ai-loading-indicator');

		// Textarea Auto-Expand Logic
		textarea.addEventListener('input', function() {
			this.style.height = 'auto';
			this.style.height = (this.scrollHeight < 150 ? this.scrollHeight : 150) + 'px';
		});

		// Add Chat Bubble Function
		function appendMessage(role, text) {
			// Agar first message hai, toh welcome screen hide kar do
			if (welcomeScreen.style.display !== 'none') {
				welcomeScreen.style.display = 'none';
			}

			const msgDiv = document.createElement('div');
			msgDiv.className = `chat-msg-wrapper`;
			msgDiv.innerHTML = `<div class="chat-msg ${role}">${text}</div>`;
			
			// Naya message loading indicator ke theek upar add karna hai
			chatContainer.insertBefore(msgDiv, loadingIndicator);
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}

		// Handle Chat Sending
		async function handleSend() {
			const prompt = textarea.value.trim();
			if (!prompt) return;

			// User ka message UI par dikhao
			appendMessage('user', prompt);
			
			// Input clear karo aur resize reset karo
			textarea.value = '';
			textarea.style.height = 'auto';
			
			// Loading dikhao
			loadingIndicator.style.display = 'block';
			chatContainer.scrollTop = chatContainer.scrollHeight;

			try {
				// API file call karo (Yahan tumhara Gemini magic hoga!)
				// Purana: const response = await sendToGemini(prompt);
				// NAYA: 👇
				const response = await sendToGroq(prompt);
				loadingIndicator.style.display = 'none';
				
				// AI ka response UI par dikhao
				appendMessage('bot', response);
			} catch (error) {
				loadingIndicator.style.display = 'none';
				appendMessage('bot', `⚠️ Error: ${error.message}`);
			}
		}

		// Click par Send karna
		sendBtn.addEventListener('click', handleSend);

	}, 100);

	return aiContainer;
}
