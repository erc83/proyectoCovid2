const covid19 = (function(){
  const state = {} 
  const URL = {
    base: 'http://localhost:3000/api',
    login: 'http://localhost:3000/api/login',
    total: 'http://localhost:3000/api/total',
    country: function(_country){
      return `${this.base}/countries/${_country}`
     }
  }
  const loginForm = document.getElementById('login-form')
  const table = document.querySelector('table#total')
  table.addEventListener('click',showModalListener)
  loginForm.addEventListener('submit',submitListener)
  function showModalListener(e){
    e.preventDefault()
    const countryTarget = e.target.dataset.country 
    if(countryTarget){
      const dataCountry = state.total.find(country => country.location === countryTarget)
      showModal(dataCountry)
    }
  }
  
  function showModal(country){
    const modalTitle = document.querySelector('.modal-title')
    modalTitle.innerText = country.location
    fillChart(country, 'modalChart')
    $('.modal').modal('show')
  }
  function fillChart(data, canvas){
    const ctx = document.getElementById(canvas).getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Confirmados', 'Fallecidos', 'Recuperados', 'Activos'],
        datasets: [{
            label: '# of Votes',
            data: [data.confirmed, data.deaths, data.recovered, data.active],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});
  }
  async function login(){
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    try {
      const result = await fetch(URL.login,{
        method: 'POST',
        body: JSON.stringify( { email: email, password: password } )
    })
    const { token } = await result.json()
    saveToken(token)
    } catch (error) {
     return error
    }
  }
  function saveToken(token){
    localStorage.setItem('jwt-token',token)
    state.token = token
  }
  async function getTotal(){
    try {
      const result = await fetch(URL.total,{
        headers: {
        Authorization: `Bearer ${state.token}`
      }
    }).then(result => result.json())
      return result.data
    } catch (error) {
      return error
    }
  }
 async function init(){
    const jwt = localStorage.getItem('jwt-token')
    if(jwt){
      //Ocultar el form y mostrar la table
      state.total = await getTotal()
      hideForm()
      showTable()
      drawGraphic(state.total)
    }  
    console.log(state);
  }
  function hideForm(){
    document.getElementById('login-form').style.display = 'none'
  }
  function showTable(){
    fillTable()
    document.getElementById('total').style.display = 'block'
  }
  function fillTable(){
    const info = state.total.map(country => `<tr>
      <td>${country.location}</td>
      <td>${country.confirmed}</td>
      <td>${country.deaths}</td>
      <td>${country.recovered}</td>
      <td>${country.active}</td>
      <td>
        <button data-country="${country.location}">Ver detalle</button>
      <td>
    </tr>`
    ).join('')
    const tableBody = document.querySelector('#total tbody')
    tableBody.innerHTML = info
  }
  function submitListener(e){
    e.preventDefault();
    login()
    init()
  }
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
          title: "Cantidad de Casos",
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
  return { init, state }  
})();
covid19.init()
// terminado con validacion token