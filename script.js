const cacheBuster = Date.now().toString().slice(7);

loadReplayList(true);

function loadReplayList(loadextra) {
    fetch('http://sim.pokeathlon.com/replays/replays.csv?' + cacheBuster).then(response => response.text()).then((data) => {
        var lines = data.split('\n');
        var output = [];
        var loadinfo = '';
        const search = parseURL();
        
        for (let line of lines) {
            let info = line.split(',');
            if (info.length != 9) continue;

            if (info[7] == search.replay) loadinfo = info;

            if (search.player || search.format) {
                if (search.player && toID(info[7]).includes(search.player)) output.push(line);
                if (search.format && toID(info[6]).includes(search.format)) output.push(line);
            } else output.push(line);
        }

        var replayContainer = document.getElementsByClassName('replay-container')[0];
        replayContainer.innerHTML = '';
        replayContainer.appendChild(createReplayList(output));

        if (loadinfo && loadextra) loadReplay(loadinfo);
        selectButton();
    });
}

function loadReplay(titleInfo) {
    const url = 'http://sim.pokeathlon.com/replays/'
    const info = parseURL();
    if (info.replay.length) {
        selectButton();
        var curReplay = document.getElementById('replay-box');
        var curTitle = document.getElementById('battle-title');
        if (curReplay && curReplay.value != info.replay) {
            curReplay.setAttribute('src', `${url}${info.replay}.html?${cacheBuster}`);
            curReplay.setAttribute('value', info.replay);

            var date = new Date(parseInt(titleInfo[5]));
            curTitle.innerHTML = `<b>${titleInfo[6]}</b> battle between <b>${titleInfo[1]}</b> and <b>${titleInfo[2]}</b> on <b>${date.getDate()}-${date.getMonth()}-${date.getFullYear()}</b><br><small>Uploaded by <b>${titleInfo[0]}</b>.</small>`;
        }
    }
}

function addReplay(e) {
    var curhash = parseURL();

    var replay = e.target.closest('.replay-button').value;

    if (replay === curhash.replay) return;
    if (curhash.replay.length) {
        document.location.hash = document.location.hash.replace(`replay=${curhash.replay}`, `replay=${replay}`);
    } else {
        document.location.hash += `replay=${replay}&`;
    }
    loadReplay(e.target.closest('.replay-button').info);
}

function selectButton() {
    const info = parseURL();
    const selected = document.querySelector('.selected');
    if (selected) selected.classList.remove('selected');

    var buttons = document.getElementsByClassName('replay-button');
    for (let button of buttons) {
        if (button.value == info.replay) {
            button.classList.add('selected');
            button.scrollIntoView();
        }
    }
}

function createReplayList(replays) {

    var replayList = document.createElement('ul');
    replayList.setAttribute('class', 'replay-list');
    
    for (let replay of replays) {
        info = replay.split(',');
        if (info.length != 9) continue;
        
        var replayElem = document.createElement('li');
        //var replayLink = createLink('?' + info[7]);
        var replayButton = createReplayButton(info);
        
       //replayLink.appendChild(replayButton);
        replayElem.appendChild(replayButton);
        replayList.appendChild(replayElem);
    }

    return replayList;
}

function getDateText(creationTime) {
    var timeDifference = Date.now() - creationTime;
    var days = Math.floor(timeDifference / 1000 / 60 / 60 / 24);
    var hours = Math.floor(timeDifference / 1000 / 60 / 60);
    var minutes = Math.floor(timeDifference / 1000 / 60);

    if (days > 6) {
        var date = new Date(creationTime);
        return `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
    } else if (days > 0 ) {
        var unit = days == 1 ? 'day' : 'days';
        return `${days} ${unit} ago`;
    } else if (hours > 0 ) {
        var unit = hours == 1 ? 'hour' : 'hours';
        return `${hours} ${unit} ago`;
    } else if (minutes > 0) {
        var unit = minutes == 1 ? 'minute' : 'minutes';
        return `${minutes} ${unit} ago`;
    } else if (minutes == 0) {
        return `just now`;
    } else {
        return '----------';
    }
}

function parseURL() {
    output = {
        'replay': '',
        'player': '',
        'format': '',
    };

    let hash = document.location.hash.replace(/#/g, '');
    for (let info of hash.split('&')) {
        let search = info.split('=');
        if (search[0] in output) output[search[0]] = (search[0] != 'replay') ? toID(search[1]) : search[1];
    }
    return output;
}

function createReplayButton(info) {
    var replayButton = document.createElement('button');
    
    replayButton.setAttribute('class', 'replay-button');
    replayButton.setAttribute('value', info[7]);
    replayButton.info = info;

    replayButton.addEventListener('click', addReplay);
    replayButton.innerHTML = `<span><b>${info[1]}</b> vs. <b>${info[2]}</b></span><br><span>${getDateText(info[5])}</span>`;
    
    return replayButton;
}

function createLink(link) {
     
    var newLink = document.createElement('a');
    newLink.setAttribute('href', link);

    return newLink
}

function clearSearch() {
    search = parseURL();
    document.location.hash = search.replay ? `replay=${search.replay}&` : ``;
    loadReplayList(false);
}

function toID(str) {
    return ('' + str).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

playerInput = document.getElementById('user');
playerInput.addEventListener('keyup', (e) => {
    const value = e.target.value;
    const curSearch = parseURL();

    if (curSearch.player == toID(value)) return;

    var buf = value ? `player=${toID(value)}&` : ``;
    if (curSearch.player) {
        document.location.hash = document.location.hash.replace(`player=${curSearch.player}&`, buf);
    } else {
        document.location.hash += buf;
    }
    loadReplayList(false);
});

formatInput = document.getElementById('format');
formatInput.addEventListener('keyup', (e) => {
    const value = e.target.value;
    const curSearch = parseURL();

    if (curSearch.format == toID(value)) return;

    var buf = value ? `format=${toID(value)}&` : ``;
    if (curSearch.format) {
        document.location.hash = document.location.hash.replace(`format=${curSearch.format}&`, buf);
    } else {
        document.location.hash += buf;
    }
    loadReplayList(false);
});