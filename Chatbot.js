$(function() {

    // Create chat container and append to body
    const $nav = $('<div class="navigation"></div>').html(`
        <div class="toggle"></div>
        <div class="screen chat-screen">
            <div class="messages" id="messages"></div>
            <div class="typebox">
                <input type="text" id="message-input" placeholder="Type a message...">
                <button id="send-message">Send</button>
            </div>
        </div>
    `).appendTo('body');

    const $toggle = $nav.find('.toggle');
// External "Chat with us" button on the page
const $externalToggle = $('#chatbot-toggle');

if ($externalToggle.length) {
    // Hide the built-in floating toggle when using the page button
    $toggle.hide();

    $externalToggle.on('click', function () {
        const opening = !$nav.hasClass('active');

        // Toggle open/close
        $toggle.toggleClass('active');
        $nav.toggleClass('active');
        sessionStorage.setItem('chatToggle', $toggle.hasClass('active'));

        // If we just closed it, don't reposition
        if (!opening) return;

        // Button position in viewport
        const rect = this.getBoundingClientRect();

        // Chat "virtual" size for positioning
        const CHAT_WIDTH  = 320;
        const MARGIN      = 10;

        // Horizontal position: align left to button, but clamp on screen
        let left = rect.left;
        const maxLeft = window.innerWidth - CHAT_WIDTH - MARGIN;
        if (left < MARGIN) left = MARGIN;
        if (left > maxLeft) left = maxLeft;

        // Vertical: make chat grow UP from the button (bottom anchored)
        // bottom distance from viewport = distance between button top and bottom of screen
        const bottom = (window.innerHeight - rect.top) + 8; // 8px gap above button

        $nav.css({
            position: 'fixed',
            left: left + 'px',
            bottom: bottom + 'px',
            top: 'auto',
            right: 'auto'
        });

        // When using anchored mode, ignore any old drag position
        sessionStorage.removeItem('chatLeft');
        sessionStorage.removeItem('chatTop');
    });
}
    // Restore toggle open state
    if (sessionStorage.getItem('chatToggle') === 'true') {
        $toggle.addClass('active');
        $nav.addClass('active');
    }

        // Restore toggle open state (only if there is NO external button)
    if (!$externalToggle.length && sessionStorage.getItem('chatToggle') === 'true') {
        $toggle.addClass('active');
        $nav.addClass('active');
    } else {
        // When we’re using the page button, start closed
        sessionStorage.setItem('chatToggle', 'false');
        $toggle.removeClass('active');
        $nav.removeClass('active');
    }

    // Draggable with drag detection (guarded so it doesn't break if UI is missing)
    let isDragging = false;

    if ($.fn && $.fn.draggable) {
        $nav.draggable({
            distance: 5,
            start: function() {
                isDragging = true;
            },
            stop: function(event, ui) {
                // Save new position for future sessions
                sessionStorage.setItem('chatLeft', ui.position.left);
                sessionStorage.setItem('chatTop', ui.position.top);

                // Use top/left for subsequent renders
                $nav.css({
                    top: ui.position.top + 'px',
                    left: ui.position.left + 'px',
                    bottom: 'auto',
                    right: 'auto'
                });

                // Delay reset so click doesn't trigger toggle after drag
                setTimeout(() => { isDragging = false; }, 10);
            }
        });
    }

    // Toggle click (used if internal toggle is visible)
    $toggle.on('click', function() {
        if (isDragging) return;
        $toggle.toggleClass('active');
        $nav.toggleClass('active');
        sessionStorage.setItem('chatToggle', $toggle.hasClass('active'));
    });

    // Chat logic
    const $messages = $nav.find('#messages');
    const $input = $nav.find('#message-input');
    const $sendBtn = $nav.find('#send-message');

    let conversation = JSON.parse(sessionStorage.getItem('chatConversation')) || [];

    function renderConversation() {
        $messages.empty();
        conversation.forEach(msg => addMessage(msg.user, msg.text, false));
    }

    function addMessage(sender, text, save = true) {
        const $msg = $(`
            <div class="message ${sender === 'You' ? 'my-message' : 'bot-message'}">
                <div class="name">${sender}</div>
                <div class="text">${text}</div>
            </div>
        `);
        $messages.append($msg);
        $messages.scrollTop($messages[0].scrollHeight);

        if (save) {
            conversation.push({ user: sender, text });
            sessionStorage.setItem('chatConversation', JSON.stringify(conversation));
        }
    }

    // Backend call to  Render chatbot
    async function handleBotResponse(text) {
        try {
            const $loading = $('<div class="message bot-message"><div class="name">Bot</div><div class="text">...</div></div>');
            $messages.append($loading);
            $messages.scrollTop($messages[0].scrollHeight);

            const res = await fetch("https://final-sl.onrender.com/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text })
            });

            const data = await res.json();
            $loading.remove();
            addMessage("Bot", data.answer || "I couldn't find an answer 😅");
        } catch (err) {
            console.error(err);
            addMessage("Bot", "Something went wrong 😅");
        }
    }

    $sendBtn.on('click', () => {
        const text = $input.val().trim();
        if (!text) return;
        addMessage('You', text);
        $input.val('');
        handleBotResponse(text);
    });

    $input.on('keypress', e => {
        if (e.key === 'Enter') $sendBtn.click();
    });

    renderConversation();
});
