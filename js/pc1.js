(() => {
	'use strict';
	let offer;
	let answer;
	let dc;
	const messages = [];
	const elmToSend = document.getElementById('to-send-box');
	const elmMsgBox = document.getElementById('message-box');
	const btnSend = document.getElementById('btn-send');
	const elmLocalSDP = document.getElementById('local-sdp-text');
	const elmRemoteSDP = document.getElementById('remote-sdp-text');
	const btnAddRemote = document.getElementById('add-remote-sdp');
	const elmCopyLocalSDP = document.getElementById('copy-local-sdp');
	const elmPasteRemoteSDP = document.getElementById('paste-remote-sdp');

	// local connection
	const pc1 = new RTCPeerConnection();

	dc = pc1.createDataChannel('channel');
	dc.onmessage = (e) => {
		console.log('new message from pc2:\n' + e.data);
		// elmMsgBox.value = elmMsgBox.value + e.data + '\n';
		messages.push({
			from: 'pc2',
			content: e.data,
		});
		renderChat();
	};
	dc.onopen = (e) => {
		console.log('messaging channel opened!');
		btnSend.disabled = false;
		elmToSend.disabled = false;
	};

	pc1.onicecandidate = (e) => {
		console.log(
			`new ICE Candidate, printing SDP:\n${JSON.stringify(
				pc1.localDescription,
			)}`,
		);
		elmLocalSDP.innerText = JSON.stringify(pc1.localDescription);
	};

	pc1.createOffer()
		.then((o) => {
			pc1.setLocalDescription(o);
			offer = o;
			elmLocalSDP.value = JSON.stringify(o);
		})
		.then(console.log('offer set locally!'));

	function renderChat() {
		let chatStr = '';
		messages.forEach((msg) => {
			chatStr += `${msg.from}: ${msg.content}\n`;
		});
		elmMsgBox.value = chatStr;
        elmMsgBox.scrollTop = elmMsgBox.scrollHeight;
	}

	function handleAddRemote(e) {
		const remoteSDP = elmRemoteSDP.value;
		answer = JSON.parse(remoteSDP);
		pc1.setRemoteDescription(answer).then(() => {
			console.log('remote description set!');
			alert('connected ;)\nready to send messages.');
		});
        elmRemoteSDP.value ='';
	}

	function handleSend(e) {
		const msgString = elmToSend.value;
		elmToSend.value = '';
        if(msgString.trim()){
            dc.send(msgString);
            messages.push({
                from: 'pc1',
                content: msgString,
            });
            renderChat();
        }
        elmToSend.focus();
	}

	function handleCopyLocalSDP(e) {
		navigator.clipboard.writeText(elmLocalSDP.value);
	}

	async function handlePaste(e) {
		const text = await navigator.clipboard.readText();
		elmRemoteSDP.value = text;
	}

	btnAddRemote.addEventListener('click', handleAddRemote);
	btnSend.addEventListener('click', handleSend);
	elmCopyLocalSDP.addEventListener('click', handleCopyLocalSDP);
	elmPasteRemoteSDP.addEventListener('click', handlePaste);
})();
