import { sendToGroq } from "../../lib/engines/groqApi";
// Yahan hum baaki sab files import karenge
import { sendToMistral } from "../../lib/engines/mistralApi";
import { sendToGlm } from "../../lib/engines/glmApi";
import { sendToMinimax } from "../../lib/engines/minimaxApi";
import { sendToGemma } from "../../lib/engines/gemmaApi";
import { sendToQwen } from "../../lib/engines/qwenApi";

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

	aiContainer.innerHTML = `
		<style>
			/* ... (Tumhara purana style same rahega) ... */
			.ai-chat-container { flex: 1; display: flex; flex-direction: column; padding: 20px; overflow-y: auto; scroll-behavior: smooth; }
			.ai-welcome-content { margin: auto; width: 100%; max-width: 400px; display: flex; flex-direction: column; align-items: center; transition: opacity 0.3s; }
			.ai-title { font-size: 22px; font-weight: 500; margin-bottom: 6px; color: #ffffff; text-align: center; }
			.ai-subtitle { font-size: 13px; color: #aaaaaa; margin-bottom: 40px; text-align: center; }
			.chat-msg-wrapper { display: flex; flex-direction: column; width: 100%; margin-bottom: 16px; }
			.chat-msg { max-width: 85%; padding: 12px 16px; border-radius: 12px; font-size: 14px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; }
			.chat-msg.user { align-self: flex-end; background: #3b82f6; color: #fff; border-bottom-right-radius: 4px; }
			.chat-msg.bot { align-self: flex-start; background: rgba(255,255,255,0.05); color: var(--text-color); border-bottom-left-radius: 4px; border: 1px solid rgba(255,255,255,0.05); }
			.chat-loading { align-self: flex-start; font-size: 12px; color: #aaaaaa; font-style: italic; margin-bottom: 16px; display: none; }
			.ai-input-wrapper { margin: 16px; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 4px; background: rgba(255, 255, 255, 0.02); display: flex; flex-direction: column; flex-shrink: 0; }
			.ai-textarea { width: 100%; background: transparent; border: none; color: #ffffff; padding: 14px 16px; font-size: 14px; resize: none; outline: none; min-height: 50px; max-height: 150px; font-family: inherit; }
			.ai-input-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 8px 16px 12px 16px; }
			.ai-toolbar-left, .ai-toolbar-right { display: flex; align-items: center; gap: 12px; }
			.ai-icon-btn { background: none; border: none; color: #ffffff; font-size: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0; line-height: 1; transition: opacity 0.2s; }
			.ai-dropdown { background: transparent; color: #ffffff; border: none; outline: none; font-size: 14px; cursor: pointer; }
			
			/* Settings Modal */
			.ai-settings-modal { display: none; position: absolute; bottom: 80px; left: 16px; right: 16px; background: #1e1e1e; border: 1px solid #333; border-radius: 8px; padding: 16px; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
			.ai-settings-modal.active { display: flex; flex-direction: column; gap: 12px; }
			.ai-settings-input { width: 100%; background: #000; border: 1px solid #444; color: #fff; padding: 8px; border-radius: 4px; font-size: 12px; }
			.ai-settings-save { background: #3b82f6; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-weight: bold; }
		</style>

		<div class="ai-chat-container" id="ai-chat-container">
			<div class="ai-welcome-content" id="ai-welcome-screen">
				<div class="ai-title">Acode Assistant</div>
				<div class="ai-subtitle">Choose your AI and start coding.</div>
			</div>
			<div class="chat-loading" id="ai-loading-indicator">Assistant is thinking...</div>
		</div>

		<div class="ai-settings-modal" id="ai-settings-modal">
			<div style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">API Settings</div>
			<input type="password" class="ai-settings-input" id="groq-key" placeholder="Groq API Key" />
			<input type="password" class="ai-settings-input" id="nvidia-key" placeholder="Nvidia API Key" />
			<button class="ai-settings-save" id="save-keys-btn">Save Keys</button>
		</div>

		<div class="ai-input-wrapper">
			<textarea class="ai-textarea" id="ai-input" rows="1" placeholder="Describe what you want to build..."></textarea>
			<div class="ai-input-toolbar">
				<div class="ai-toolbar-left">
					<button class="ai-icon-btn" id="ai-settings-btn" style="font-size: 18px;">⚙️</button>
					<select class="ai-dropdown" id="ai-model-select">
						<option value="groq">Llama 3 (Groq)</option>
						<option value="mistral">Mistral 128B (Nvidia)</option>
						<option value="glm">GLM 5.1 (Nvidia)</option>
						<option value="minimax">MiniMax (Nvidia)</option>
						<option value="gemma">Gemma 4 31B (Nvidia)</option>
						<option value="qwen">Qwen 3.5 122B (Nvidia)</option>
					</select>
				</div>
				<div class="ai-toolbar-right">
					<button class="ai-icon-btn" id="ai-send-btn" style="font-size: 18px;">►</button>
				</div>
			</div>
		</div>
	`;

	setTimeout(() => {
		const textarea = aiContainer.querySelector('#ai-input');
		const sendBtn = aiContainer.querySelector('#ai-send-btn');
		const chatContainer = aiContainer.querySelector('#ai-chat-container');
		const welcomeScreen = aiContainer.querySelector('#ai-welcome-screen');
		const loadingIndicator = aiContainer.querySelector('#ai-loading-indicator');
		const modelSelect = aiContainer.querySelector('#ai-model-select');
		
		// Settings Logic
		const settingsBtn = aiContainer.querySelector('#ai-settings-btn');
		const settingsModal = aiContainer.querySelector('#ai-settings-modal');
		const saveKeysBtn = aiContainer.querySelector('#save-keys-btn');
		const groqInput = aiContainer.querySelector('#groq-key');
		const nvidiaInput = aiContainer.querySelector('#nvidia-key');

		// Load saved keys
		groqInput.value = localStorage.getItem('ACODE_GROQ_API_KEY') || '';
		nvidiaInput.value = localStorage.getItem('ACODE_NVIDIA_API_KEY') || '';

		settingsBtn.addEventListener('click', () => {
			settingsModal.classList.toggle('active');
		});

		saveKeysBtn.addEventListener('click', () => {
			localStorage.setItem('ACODE_GROQ_API_KEY', groqInput.value.trim());
			localStorage.setItem('ACODE_NVIDIA_API_KEY', nvidiaInput.value.trim());
			settingsModal.classList.remove('active');
			appendMessage('bot', "✅ API Keys saved successfully!");
		});

		textarea.addEventListener('input', function() {
			this.style.height = 'auto';
			this.style.height = (this.scrollHeight < 150 ? this.scrollHeight : 150) + 'px';
		});

		function appendMessage(role, text) {
			if (welcomeScreen.style.display !== 'none') welcomeScreen.style.display = 'none';
			const msgDiv = document.createElement('div');
			msgDiv.className = `chat-msg-wrapper`;
			msgDiv.innerHTML = `<div class="chat-msg ${role}">${text}</div>`;
			chatContainer.insertBefore(msgDiv, loadingIndicator);
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}

		async function handleSend() {
			const prompt = textarea.value.trim();
			if (!prompt) return;

			appendMessage('user', prompt);
			textarea.value = '';
			textarea.style.height = 'auto';
			loadingIndicator.style.display = 'block';
			chatContainer.scrollTop = chatContainer.scrollHeight;

			try {
				const botMsgDiv = document.createElement('div');
				botMsgDiv.className = `chat-msg-wrapper`;
				botMsgDiv.innerHTML = `<div class="chat-msg bot"></div>`; 
				chatContainer.insertBefore(botMsgDiv, loadingIndicator);
				const botTextNode = botMsgDiv.querySelector('.chat-msg.bot');

				const selectedModel = modelSelect.value;
				let engineFunction;

				// 🔀 THE ROUTER: Dropdown ke hisaab se sahi engine select karo
				switch(selectedModel) {
					case 'mistral': engineFunction = sendToMistral; break;
					case 'glm': engineFunction = sendToGlm; break;
					case 'minimax': engineFunction = sendToMinimax; break;
					case 'gemma': engineFunction = sendToGemma; break;
					case 'qwen': engineFunction = sendToQwen; break;
					default: engineFunction = sendToGroq;
				}

				await engineFunction(prompt, (realTimeText) => {
					if (loadingIndicator.style.display !== 'none') loadingIndicator.style.display = 'none';
					botTextNode.textContent = realTimeText;
					chatContainer.scrollTop = chatContainer.scrollHeight;
				});

				loadingIndicator.style.display = 'none';
			} catch (error) {
				loadingIndicator.style.display = 'none';
				appendMessage('bot', `⚠️ Error: ${error.message}`);
			}
		}

		sendBtn.addEventListener('click', handleSend);
	}, 100);

	return aiContainer;
}
