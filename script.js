const cacheBuster = Date.now().toString().slice(7);
const loadInfo = parseURL();
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if(isMobile) {
    var redirect = parseURL().replay;
    if (redirect) window.location.replace("https://sim.pokeathlon.com/replays/" + redirect + ".html?" + cacheBuster);

    var battleContainer = document.querySelectorAll('.battle-container');
    battleContainer.forEach(container => {container.style.display = 'none';});
    
    var leftContainer = document.querySelectorAll('.left-container');
    leftContainer.forEach(container => {container.style.width = '100vw';});

    var title = document.querySelectorAll('.search-container h1');
    title.forEach(container => {container.style['font-size'] = '25pt';});

    var search = document.querySelectorAll('.search-container span input');
    search.forEach(container => {container.style['font-size'] = '10pt'; container.style.height = '2vh'; container.style.width = '27vw';});

    var clearButton = document.querySelectorAll('.search-container button');
    clearButton.forEach(container => {container.style['font-size'] = '10pt'; container.style.height = '3vh'; container.style.width = '30vw'; container.style['align-items'] = 'center';});
}

loadReplayList(true);

document.getElementById('format').value = loadInfo.format;
document.getElementById('user').value = loadInfo.player;

function loadReplayList(loadextra) {
    fetch('https://sim.pokeathlon.com/replays/replays.csv?' + cacheBuster).then(response => response.text()).then((data) => {
        var lines = data.split('\n');
        var output = data.split('\n');
        var loadinfo = '';
        const search = parseURL();
        
        for (let line of lines) {
            let info = line.split(',');
            if (info.length != 9) continue;

            if (info[7] == search.replay) loadinfo = info;

            if ((search.player && !info[7].includes(search.player)) || (search.format && !toID(info[6]).includes(search.format)))output.splice(output.indexOf(line), 1);
        }

        var replayContainer = document.getElementsByClassName('replay-container')[0];
        replayContainer.innerHTML = '';
        replayContainer.appendChild(createReplayList(output));

        if (loadinfo && loadextra) loadReplay(loadinfo);
        selectButton();
    });
}

function loadReplay(titleInfo) {
    const url = 'https://sim.pokeathlon.com/replays/'
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
    if (curhash.replay) {
        document.location.hash = document.location.hash.replace(`replay=${curhash.replay}`, `replay=${replay}`);
    } else if ((curhash.player || curhash.format) && !document.location.hash.endsWith('&')) {
        document.location.hash += `&replay=${replay}`;
    } else {
        document.location.hash += `replay=${replay}`;
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
            button.scrollIntoView({block: "center", behavior: "smooth"});
        }
    }
}

function createReplayList(replays) {

    var replayList = document.createElement('ul');
    replayList.setAttribute('class', 'replay-list');
    
    for (let replay of replays.reverse()) {
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
        var date = new Date(0);
        date.setUTCMilliseconds(creationTime);
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
    
    replayButton.setAttribute('class', isMobile ? 'replay-button-mobile' : 'replay-button');
    replayButton.setAttribute('value', info[7]);
    replayButton.info = info;

    replayButton.addEventListener('click', addReplay);

    replayButton.innerHTML = `<span><b>${info[1]}</b> vs. <b>${info[2]}</b></span><br><span>${getDateText(info[5])}</span>`;
    
    var replayLink = createLink('https://sim.pokeathlon.com/replays/' + info[7] + '.html');
    replayLink.appendChild(replayButton);

    return isMobile ? replayLink : replayButton;
}

function createLink(link) {
    var newLink = document.createElement('a');
    newLink.setAttribute('href', link);
    newLink.setAttribute('target', '_blank');

    return newLink
}

function clearSearch() {
    search = parseURL();
    document.location.hash = search.replay ? `replay=${search.replay}` : ``;
    document.getElementById('format').value = '';
    document.getElementById('user').value = '';
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

    var amper = document.location.hash.includes('&player') ? `&` : ``;
    var buf = value ? `${amper}player=${toID(value)}` : ``;
    if (curSearch.player) {
        document.location.hash = document.location.hash.replace(`${amper}player=${curSearch.player}`, buf);
    } else {
        document.location.hash += '&' + buf;
    }
    loadReplayList(false);
});

formatInput = document.getElementById('format');
formatInput.addEventListener('keyup', (e) => {
    const value = e.target.value;
    const curSearch = parseURL();

    if (curSearch.format == toID(value)) return;

    var amper = document.location.hash.includes('&format') ? `&` : ``;
    var buf = value ? `${amper}format=${toID(value)}` : ``;
    if (curSearch.format) {
        document.location.hash = document.location.hash.replace(`${amper}format=${curSearch.format}`, buf);
    } else {
        document.location.hash += '&' + buf;
    }
    loadReplayList(false);
});