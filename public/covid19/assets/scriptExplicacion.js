const Countries = (async () => {    //se crea la constante Countries y se sube async
    const urlApi = "http://localhost:3000/api/total";
    const retorno = await getData(urlApi)
    const paises = await retorno.filter(pais => pais.active >= 10000)  //la funcion paises no esta expuesta esta dentro de un IIFE
    fillPaisTable(await paises);   //ejecutando funcion fillPaisTable
  
    return { paises: await paises } // esta return logra que la funcion sea expuesta para poder acceder a ella y se agrego await paises entre llaves
  })()
  
  async function getData(url) {
    try {
      const resp = await fetch(url).then(resp => resp.json())
      console.log(resp.data)
      return resp.data;
    } catch (error) {
      console.log(error)
    }
  }
  function fillPaisTable(paises) {
    let tableContent = ''
    paises.forEach((pais, i) => {   //esta bueno este forEach pero es javascript puro se agrego la variable i
      tableContent += `<tr>
     <td>${pais.location}</td>
     <td>${pais.confirmed}</td>
     <td>${pais.recovered}</td>
     <td>${pais.deaths}</td>
     <td>${pais.active}</td>
     <td>
        <button data-id="${i}" data-country="${pais.location}" class="modelo">Ver detalles</button>  
      </td>
     </tr>`
    })
    let data = document.querySelector("#paises tbody")
    //console.log(tableContent)
    data.innerHTML = data.innerHTML + tableContent
  }
  
  
  
  
  function modalHtmlDetail(pais) { // fn que crea html del modal y pais es el parametro
    const ctx = document.querySelector('#chartContainer').getContext('2d');    //inicio grafico
    const dataPaises = [pais.confirmed, pais.recovered, pais.deaths, pais.active]
    const paisesName = ['confirmados', 'recuperados', 'muertos', 'activos' ];
    console.log(dataPaises)
    const config = {
        type: 'bar',
        data: {
            labels: paisesName,
            datasets:  [{
              data: dataPaises,
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)'
            ],
          }]
        },
        options: { scales: { yAxes: [{ ticks: { beginAtZero: true } }] } }
    }
    new Chart(ctx, config);
  }    //termino de grafico
  
  document.addEventListener('click', async function (e) {  //addEventListener detecta todos los click del documento
    if (e.target.classList.contains('modelo')) {
      const country = e.target.dataset.country     //dataset lee todos los atributos que tienen data, meta oficialmente recomiendan utilizar atributos personalizados
                    // dataset.country llama solo a los paises, dataset llama a los data-id y data-coutry del botton class modelo 
      const selectedCountry = await Countries.then(info => info.paises.filter(pais => pais.location === country))
      modalHtmlDetail(selectedCountry[0])
      const modalTile = document.querySelector('.modal-title')
      modalTile.innerText = selectedCountry[0].location
      $('.modal').modal('show')
  
    }
  })
  
  /*
  //para ocultar
  function toggleFormTable() {
    $('form').toggle()
    $("#paises").toggle()
  
  }
  */
  function drawGraphin(paises){
    
  }