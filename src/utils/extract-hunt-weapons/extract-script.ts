export { }

var req = await fetch("https://huntshowdown.rocks/ajax/ajax.php", {
    "headers": {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    "referrer": "https://huntshowdown.rocks/en/weapons",
    "body": "what=loadweapons&category=6&term=&sort=&direction=",
    "method": "POST",
    "mode": "cors",
    "credentials": "include"
});

var res = await req.json()
console.log(res)