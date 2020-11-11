const Countries = (async () => {
  const urlApi = "http://localhost:3000/api/total";
  const retorno = await getData(urlApi)
  const paises = await retorno.filter(pais => pais.active >= 10000)
  fillPaisTable(await paises);   //ejecutando funcion fillPaisTable
  drawGraphic(paises); //ejecuta function drawGraphic
​
  return { paises: await paises }      // esta return logra que la funcion sea expuesta
})()
​
async function getData(url) {
  try {
    const resp = await fetch(url).then(resp => resp.json())
    //console.log(resp.data)
    return resp.data;
  } catch (error) {
    console.log(error)
  }
}
function fillPaisTable(paises) {
  let tableContent = ''
  paises.forEach((pais, i) => {
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
​
function modalHtmlDetail(pais) { // grafico
  const ctx = document.querySelector('#chartContainer').getContext('2d');
  const dataPaises = [pais.confirmed, pais.recovered, pais.deaths, pais.active]
  const paisesName = ['confirmados', 'recuperados', 'muertos', 'activos' ];
  //console.log(dataPaises)
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
}
document.addEventListener('click', async function (e) {
  if (e.target.classList.contains('modelo')) {
    const country = e.target.dataset.country
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
function drawGraphic(paises){
  const confirmados = []
  paises.map(pais => confirmados.push({label: pais.location, y: pais.confirmed}));
  const recuperados = []
  paises.map(pais => recuperados.push({label: pais.location, y: pais.recovered}));
  const muertos = []
  paises.map(pais => muertos.push({label: pais.location, y: pais.deaths}));
  const activos = []
  paises.map(pais => activos.push({label: pais.location, y: pais.active}));
 
  const chart = new CanvasJS.Chart("chartContainerBody", {
      animationEnabled: true,
      title:{
          text: " Global Impact Graph Covid 19"
      },	
      axisY: {
          title: "",
          titleFontColor: "#4F81BC",
          lineColor: "#4F81BC",
          labelFontColor: "#4F81BC",
          tickColor: "#4F81BC"
      },
      toolTip: {
          shared: true
      },
      legend: {
          cursor:"pointer",
          itemclick: toggleDataSeries
      },
      data: [{
          type: "column",
          name: "confirmados",
          legendText: "Confirmados",
          showInLegend: true, 
          dataPoints: confirmados 
      },
    {
          type: "column",
          name: "recuperados",
          legendText: "Recuperados",
          showInLegend: true, 
          dataPoints: recuperados
      },
    {
          type: "column",
          name: "muertos",
          legendText: "Muertos",
          showInLegend: true, 
          dataPoints: muertos
      },
    {
          type: "column",
          name: "activos",
          legendText: "Activos",
          showInLegend: true, 
          dataPoints: activos
      }]
  })
  ;
  chart.render();
  
  function toggleDataSeries(e) {
      if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
          e.dataSeries.visible = false;
      }
      else {
          e.dataSeries.visible = true;
      }
      chart.render();
  }      
} 
}

//function drawGraphin(paises){
  
//}