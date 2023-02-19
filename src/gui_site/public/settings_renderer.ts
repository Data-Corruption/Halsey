// get domain, port, bot route, and token from url
const url = window.location.href;
const domain = url.split('/')[2].split(':')[0];
const port = url.split('/')[2].split(':')[1];
const botRoute = url.split('/')[3];
const token = url.split('/')[4];

/** Returns the element with the given id. Throws an error if the element does not exist. */
function get_element_by_id_critical(id: string): HTMLElement {
    var element: HTMLElement | null = document.getElementById(id);
    if (element == null) {
      throw new Error(`Element with id '${id}' does not exist.`);
    }
    return element;
}

var open_guild: any | null = null;
var popup = get_element_by_id_critical("popup");
var main_content = get_element_by_id_critical("main_content");

// populate commands
try {
    fetch(`https://${domain}:${port}/${botRoute}/commands/${token}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }).then(response => response.json()).then(data => {
        const command_list = get_element_by_id_critical("commands");
        command_list.innerHTML = '';
        for (const command of data) {
            const commandDiv = document.createElement('div');
            commandDiv.classList.add('command', 'row');
            if (command.data.description == null) {
                command.data.description = "No description";
            }
            commandDiv.innerHTML = `
                <input type="checkbox" disabled>
                <label>${command.data.name}</label>
                <p>${command.data.description}</p>
            `;
            command_list.appendChild(commandDiv);
        }
    });
} catch (error) {
    console.error(error);
}

// popup
function close_popup() {
    popup.classList.add("hidden");
    main_content.classList.remove("blurred");
}
function open_popup() {
    popup.classList.remove("hidden");
    main_content.classList.add("blurred");
}

function update_checkboxes(guild_id: string) {
    try {
        fetch(`https://${domain}:${port}/${botRoute}/guild/${guild_id}/commands/${token}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }).then(response => response.json()).then(data => {
            const command_list = get_element_by_id_critical("commands");
            for (const command of command_list.children) {
                const input = command.children[0] as HTMLInputElement;
                const label = command.children[1] as HTMLLabelElement;
                input.disabled = false;
                if (data.includes(label.innerText)) {
                    input.checked = true;
                } else {
                    input.checked = false;
                }
            }
        });
    } catch (error) {
        console.error(error);
    }
}

// guild dropdown
const guild_dropdown_button = document.getElementById('guild_dropdown_button') as HTMLButtonElement;
const guild_dropdown_content = document.getElementById('guild_dropdown_content') as HTMLDivElement;
guild_dropdown_button.addEventListener('click', () => {
    guild_dropdown_content.classList.toggle('hidden');
    if (guild_dropdown_content.classList.contains('hidden')) {
        guild_dropdown_button.innerText = guild_dropdown_button.innerText.slice(0, -1) + '▾';
        guild_dropdown_button.classList.remove('squared_bottom');
        return;
    }
    guild_dropdown_button.innerText = guild_dropdown_button.innerText.slice(0, -1) + '▴';
    guild_dropdown_button.classList.add('squared_bottom');

    // set width of dropdown to width of button
    guild_dropdown_content.style.width = guild_dropdown_button.offsetWidth + 'px';

    // populate guild dropdown
    try {
        fetch(`https://${domain}:${port}/${botRoute}/guilds/${token}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }).then(response => response.json()).then(data => {
            guild_dropdown_content.innerHTML = '';
            for (const guild of data) {
                const guild_button = document.createElement('button');
                guild_button.innerText = guild.name;
                guild_button.classList.add('guild_button');
                guild_button.setAttribute('data-guild_id', guild.id);
                guild_button.addEventListener('click', () => {
                    guild_dropdown_button.innerText = guild.name + ' ▾';
                    guild_dropdown_content.classList.add('hidden');
                    guild_dropdown_button.classList.remove('squared_bottom');
                    open_guild = guild;
                    update_checkboxes(guild.id);
                });
                guild_dropdown_content.appendChild(guild_button);
            }
        });
    } catch (error) {
        console.error(error);
    }
});

// update commands button
const update_commands_button = get_element_by_id_critical('update_commands_button');
update_commands_button.addEventListener('click', () => {
    if (open_guild == null) {
        return;
    }
    const command_list = get_element_by_id_critical("commands");
    const commands: string[] = [];
    for (const command of command_list.children) {
        const input = command.children[0] as HTMLInputElement;
        const label = command.children[1] as HTMLLabelElement;
        if (input.checked) {
            commands.push(label.innerText);
        }
    }
    console.log(commands);
    try {
        fetch(`https://${domain}:${port}/${botRoute}/guild/${open_guild.id}/commands/${token}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(commands)
        }).then(response => response.json()).then(data => {
            if (data.success) {
                // fill in success message and button to close popup
                popup.innerHTML = `
                    <p>Updated ${open_guild.name}'s command whitelist successfully.</p>
                    <button class="button" id="close_popup_button">Close</button>
                `;
                get_element_by_id_critical('close_popup_button').addEventListener('click', () => {
                    close_popup();
                });
                open_popup();
            }
        });
    } catch (error) {
        console.error(error);
    }
});