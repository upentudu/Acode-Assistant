export default function createAIAssistantUI() {
	// AI UI ka main container
	const aiContainer = document.createElement("div");
	aiContainer.style.height = "100%";
	aiContainer.style.width = "100%";
	aiContainer.style.display = "flex";
	aiContainer.style.flexDirection = "column";
	aiContainer.style.backgroundColor = "var(--bg-color)";
	aiContainer.style.color = "var(--text-color)";
	aiContainer.style.overflow = "hidden";
	aiContainer.style.fontFamily = "sans-serif";

	// Naya Design HTML & CSS
	aiContainer.innerHTML = `
		<style>
			/* Welcome Screen Layout */
			.ai-welcome-screen {
				flex: 1;
				display: flex;
				flex-direction: column;
				padding: 20px;
				overflow-y: auto;
			}
			/* YE HAI SCROLL BUG KA FIX 👇 */
			.ai-welcome-content {
				margin: auto;
				width: 100%;
				max-width: 400px;
				display: flex;
				flex-direction: column;
				align-items: center;
			}
			.ai-title {
				font-size: 22px;
				font-weight: 500;
				margin-bottom: 6px;
				letter-spacing: 0.5px;
				color: #ffffff;
				text-align: center;
			}
			.ai-subtitle {
				font-size: 13px;
				color: #aaaaaa;
				margin-bottom: 40px;
				text-align: center;
			}
			
			/* Guide Tree Section */
			.ai-guide-container {
				text-align: left;
				width: 100%;
			}
			.ai-guide-title {
				font-size: 18px;
				font-weight: 500;
				margin-bottom: 12px;
				color: #ffffff;
			}
			.ai-guide-tree {
				font-family: monospace;
				color: #aaaaaa;
				line-height: 2;
				font-size: 14px;
			}
			
			/* Custom Links & Expandable Layout */
			.ai-guide-tree a {
				color: #d8b4fe;
				text-decoration: none;
				border-bottom: 1px dotted #d8b4fe;
				transition: opacity 0.2s;
			}
			.ai-guide-tree a:active { opacity: 0.5; }
			
			.tree-details { outline: none; }
			.tree-details summary {
				cursor: pointer;
				outline: none;
				user-select: none;
				color: #ffffff;
				transition: color 0.2s;
				list-style: none; /* Hide default arrow natively */
			}
			.tree-details summary:active { color: #d8b4fe; }
			.tree-details summary::-webkit-details-marker { display: none; }

			/* Expandable Content Styles */
			.tree-content {
				padding-left: 28px;
				margin-top: 10px;
				font-family: sans-serif;
				font-size: 13px;
				color: #cccccc;
				line-height: 1.6;
				margin-bottom: 20px;
			}
			.tree-content pre {
				background: rgba(0, 0, 0, 0.4);
				padding: 10px;
				border-radius: 6px;
				font-family: monospace;
				color: #a78bfa;
				margin: 8px 0 16px 0;
				/* YE HAI CODE WRAP KA FIX 👇 */
				white-space: pre-wrap;
				word-wrap: break-word;
				overflow-wrap: anywhere;
				border: 1px solid rgba(255, 255, 255, 0.05);
			}
			.tree-content code {
				background: rgba(0, 0, 0, 0.4);
				padding: 2px 5px;
				border-radius: 4px;
				font-family: monospace;
				color: #a78bfa;
			}
			.important-note {
				border-left: 3px solid #facc15;
				padding: 8px 12px;
				margin-top: 12px;
				background: rgba(250, 204, 21, 0.1);
				color: #fef08a;
				border-radius: 0 4px 4px 0;
			}
			
			/* Bottom Input Area */
			.ai-input-wrapper {
				margin: 16px;
				border: 1px solid rgba(255, 255, 255, 0.3);
				border-radius: 4px;
				background: rgba(255, 255, 255, 0.02);
				display: flex;
				flex-direction: column;
				flex-shrink: 0;
			}
			.ai-textarea {
				width: 100%;
				background: transparent;
				border: none;
				color: #ffffff;
				padding: 14px 16px;
				font-size: 14px;
				resize: none;
				outline: none;
				min-height: 50px;
				max-height: 150px;
				font-family: inherit;
			}
			.ai-textarea::placeholder { color: #888888; }
			
			/* Toolbar inside Input Area */
			.ai-input-toolbar {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 8px 16px 12px 16px;
			}
			.ai-toolbar-left, .ai-toolbar-right {
				display: flex;
				align-items: center;
				gap: 12px;
			}
			
			/* Interactive Elements */
			.ai-icon-btn {
				background: none;
				border: none;
				color: #ffffff;
				font-size: 22px;
				cursor: pointer;
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 0;
				line-height: 1;
				transition: opacity 0.2s;
			}
			.ai-icon-btn:active { opacity: 0.5; }
			.ai-dropdown {
				background: transparent;
				color: #ffffff;
				border: none;
				outline: none;
				font-size: 14px;
				cursor: pointer;
				appearance: none; 
				-webkit-appearance: none;
				font-weight: 500;
			}
			.ai-dropdown option {
				background: #2d2d2d;
				color: #ffffff;
			}
		</style>

		<div class="ai-welcome-screen" id="ai-chat-canvas">
			<div class="ai-welcome-content">
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
										Install the Server in Termux: To install everything required, including prompts for GUI-related tools like TigerVNC and Websockify (if needed), run the following command in Termux:
										<pre>curl -sL https://raw.githubusercontent.com/bajrangCoder/acode-plugin-acodex/main/installServer.sh | bash</pre>
										Or use this to install server along with gui packages:
										<pre>curl -sL https://raw.githubusercontent.com/bajrangCoder/acode-plugin-acodex/main/installServer.sh | bash -s -- --gui</pre>
										Alternatively, you can manually install the required packages:
										<pre>pkg update && pkg upgrade -y
curl -sL https://raw.githubusercontent.com/bajrangCoder/acode-plugin-acodex/main/installServer.sh | bash
# for gui only
pkg install x11-repo
pkg install tigervnc -y
curl -L https://raw.githubusercontent.com/bajrangCoder/websockify_rs/main/install.sh | bash</pre>
									</li>
								</ol>
								
								<div style="margin-top: 16px;">The key steps are:</div>
								<ul style="padding-left: 16px; margin-top: 6px;">
									<li>Install <code>axs</code> cli binary.</li>
									<li>If you plan to run GUI apps, also install <code>tigervnc</code> and <code>websockify_rs</code>.</li>
								</ul>

								<div class="important-note">
									<strong>[!IMPORTANT]</strong> After installing TigerVNC, make sure to set a password by running the <code>vncserver</code> command the first time.
								</div>
							</div>
						</details>
					</div>
				</div>
			</div>
		</div>

		<div class="ai-input-wrapper">
			<textarea class="ai-textarea" id="ai-input" rows="1" placeholder="Describe what you want to build..."></textarea>
			
			<div class="ai-input-toolbar">
				<div class="ai-toolbar-left">
					<button class="ai-icon-btn" title="Attach Files" onclick="alert('Attachments coming soon!')">+</button>
					<select class="ai-dropdown" id="ai-model-select">
						<option value="gemini">Gemini</option>
						<option value="claude">Claude</option>
						<option value="gpt4">GPT-4</option>
					</select>
				</div>
				<div class="ai-toolbar-right">
					<select class="ai-dropdown" id="ai-mode-select">
						<option value="plan" selected>Plan</option>
						<option value="execute">Execute</option>
					</select>
					<button class="ai-icon-btn" style="font-size: 18px;" title="Send" onclick="alert('Message Sent! 🚀')">►</button>
				</div>
			</div>
		</div>
	`;

	// Auto-expanding textarea logic
	setTimeout(() => {
		const textarea = aiContainer.querySelector('#ai-input');
		if(textarea) {
			textarea.addEventListener('input', function() {
				this.style.height = 'auto';
				this.style.height = (this.scrollHeight < 150 ? this.scrollHeight : 150) + 'px';
			});
		}
	}, 100);

	return aiContainer;
}
