(() => {
	'use strict';

	// data channel
	let offer;
	let answer;
	let dc;
	const messages = [];
	const elmMsgBox = document.getElementById('message-box');
	const elmToSend = document.getElementById('to-send-box');
	const btnSend = document.getElementById('btn-send');
	const elmRemoteSDP = document.getElementById('remote-sdp-text');
	const elmLocalSDP = document.getElementById('local-sdp-text');
	const btnAddRemote = document.getElementById('add-remote-sdp');
	const elmCopyLocalSDP = document.getElementById('copy-local-sdp');
	const elmPasteRemoteSDP = document.getElementById('paste-remote-sdp');

	const pc2 = new RTCPeerConnection();
	pc2.onicecandidate = (e) => {
		console.log(
			`new ICE Candidate, printing sdp:\n${JSON.stringify(
				pc2.localDescription,
			)}`,
		);
		elmLocalSDP.innerText = JSON.stringify(pc2.localDescription);
	};

	pc2.ondatachannel = (e) => {
		dc = e.channel;
		dc.onmessage = (e) => {
			console.log('new message from pc1:\n' + e.data);
			// elmMsgBox.value = elmMsgBox.value + e.data + '\n';
			messages.push({
				from: 'pc1',
				content: e.data,
			});
			renderChat();
		};
		dc.onopen = (e) => {
			console.log('messaging channel opened!');
			btnSend.disabled = false;
			elmToSend.disabled = false;
		};
	};

	function renderChat() {
		let chatStr = '';
		messages.forEach((msg) => {
			chatStr += `${msg.from}: ${msg.content}\n`;
		});
		elmMsgBox.value = chatStr;
	}

	function handleAddRemote(e) {
		const sdpString = elmRemoteSDP.value;
		offer = JSON.parse(sdpString);
		console.log('offer:\n' + JSON.stringify(offer));
		pc2.setRemoteDescription(offer)
			.then(console.log('pc2 offer accepted and set!'))
			.then(() =>
				pc2
					.createAnswer()
					.then((a) => {
						answer = a;
						pc2.setLocalDescription(a);
						elmLocalSDP.innerText = JSON.stringify(a);
					})
					.then(console.log('pc2 local answer set!')),
			);
		elmRemoteSDP.value = '';
	}

	function handleCopyLocalSDP(e) {
		navigator.clipboard.writeText(elmLocalSDP.value);
	}

	function handleSend(e) {
		const msgString = elmToSend.value;
		elmToSend.value = '';
        if(msgString.trim()){
            dc.send(msgString);
            messages.push({
                from: 'pc2',
                content: msgString,
            });
            renderChat();
        }
		elmToSend.focus();
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
