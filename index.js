$( document ).ready(function() {
    const arr =[];
    const modal = document.getElementById("myModal");
    const span = document.getElementsByClassName("close")[0];

   $("#aboutContainer").hide();
   $("#liveReportsContainer").hide();

    fetch ('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc')
    .then((response) => response.json())
    .then((data) => {
        addCards(data)
        search(data)
    });
    function createCard(item) {
        const card = `
            <div id="card_${item.symbol}" class="card ,col-md-4" style="width: 18rem "row="col-4">
                <img src="${item.image}" class="card-img-top" alt="...">
                <div class="card-body">
                <h5 class="card-title">${item.symbol}</h5>
                <p class="card-text">${item.name}</p>
                <button class="btn btn-primary" id="btnMoreInfo_${item.id}" type="button"  data-bs-toggle="collapse" data-bs-target="#collapseExample_${item.id}" aria-expanded="false" aria-controls="collapseExample">
                more info
                </button>
                <div class="collapse" id="collapseExample_${item.id}">

                <div class="card card-body"id="moreInfoText_${item.id}">
                    <div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                </div>
                </div>
                <div class="form-check form-switch">
                <input class= "form-check-input"  type="checkbox" role="switch" id="flexSwitchCheckDefault_${item.symbol}">
                <label class= "form-check-label" for="flexSwitchCheckDefault"></label>
                </div>
                </div>
                </div>
            </div>
        `
        return card;
    }
    function addCards(data) {
        data.forEach(item => {
            const card = createCard(item)
            $('#containerCards').append(card)
            $(`#btnMoreInfo_${item.id}`).on('click', function () {
                getMoreInfoData(item.id) 
            }); 
                
            $(`#flexSwitchCheckDefault_${item.symbol}`).on('click', function () {
                if(document.getElementById(`flexSwitchCheckDefault_${item.symbol}`).checked) {
                    if(arr.length < 5) {
                        arr.push(item.symbol)
                    } else {
                        switchOff(`#flexSwitchCheckDefault_${item.symbol}`)
                        openModal()
                    }   
                } else {
                    removeItemFromArray(item.symbol)
                }               
            })
        });
    }
    function removeItemFromArray(symbol){
        const index = arr.indexOf(symbol);
        if (index !== -1) {
            arr.splice(index, 1);
        }
    }
    function switchOff(switchButtonId){
        $(switchButtonId).prop("checked", false); 
    }
    function switchOn(switchButtonId){
        $(switchButtonId).prop("checked", true); 
    }
    async function getMoreInfoData(id){
        try {
            const url = `https://api.coingecko.com/api/v3/coins/${id}`;
            addCoinCache(url,id)
        } catch(err) {
            console.log('error',err);
        }    
    }
    function addCoinsToCollapse(eur, ils, usd, id) {
        const containerCoin = $('<div></div>').addClass("containerCoin")
        .append(`
            <div>${usd} &#36</div>
            <div>${eur} &#8364</div>
            <div>${ils} &#8362</div> 
        `)
        $(`#moreInfoText_${id}`).html(containerCoin)   
    }
    async function addCoinCache(url, id) {
        let cachedResponse = await caches
        .open("coinCache")
        .then((cache) => cache
        .match(url));

        if(cachedResponse) {
        const date = new Date(cachedResponse.headers.get('expires'))
        const isOverDate = Date.now() > date.getTime() + 1000 * 60 * 2

        if(isOverDate) {
            await caches.open("coinCache").then((cache) => cache.addAll([url]))
            cachedResponse = await caches.open("coinCache").then((cache) => cache.match(url));
        }
        } else {
        await caches.open("coinCache").then((cache) => cache.addAll([url]))
            cachedResponse = await caches.open("coinCache").then((cache) => cache.match(url));
        }
        const response = await cachedResponse.json();
        const coin = response?.market_data?.current_price;

        const eur = coin.eur
        const ils = coin.ils
        const usd = coin.usd
        addCoinsToCollapse(eur, ils, usd, id)
    }
    function search(data) {
        $('#searchBtn').on('click', function () {
            const inputValue = document.getElementById('inputSearch')
            const value = inputValue.value;
            data.forEach(item => {
                if (item.symbol != value) {
                    $(`#card_${item.symbol}`).hide();
                }
            })
        })
    }
    $('#pills-home-tab').on('click', function () {
        $("#aboutContainer").hide();
        $("#liveReportsContainer").hide();
        $(".card").show();
    })
    $('#pills-about-tab').on('click', function () {
        $(".card").hide();
        $("#liveReportsContainer").hide();
        $("#aboutContainer").show();
    })
    $('#pills-liveReport-tab').on('click', function () {
        $(".card").hide();
        $("#aboutContainer").hide();
        $("#liveReportsContainer").show();
    })
    function openModal(){
        modal.style.display = "block";
        const modall = $("<div id='modalButton'></div>");

        for (let index = 0; index < arr.length; index++) {
            const coin = arr[index];
        
            modall.append(`
                <div class="rowModal style="width: 18rem;">
                    <div class="cardModal">
                        <h5 class="card-title">${coin}</h5> 
                        <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckChecked_${coin}" checked>
                        <label class="form-check-label" for="flexSwitchCheckChecked"></label>
                        </div>
                    </div>
                </div>
            `)

            $(document).on("click", `#flexSwitchCheckChecked_${coin}` , function() {
                if(document.getElementById(`flexSwitchCheckChecked_${coin}`).checked) {
                    switchOn(`#flexSwitchCheckDefault_${coin}`)
                    arr.push(`${coin}`)
                } else {
                    removeItemFromArray(coin);
                    switchOff(`#flexSwitchCheckDefault_${coin}` )
                }  
            })
        }
        $('#modalBody').html(modall);
        span.onclick = function() {
            modal.style.display = "none";
            removeModalButtons()
        }
    }
  
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            removeModalButtons()
        }
    }
    function removeModalButtons(){
        $('#modalButton').remove();
    }
})