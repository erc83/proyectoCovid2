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
  const UrlChile = {
    confirmed: 'http://localhost:3000/api/confirmed',
    deaths: 'http://localhost:3000/api/deaths',
    recovered: 'http://localhost:3000/api/recovered',
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
            label: 'Cantidad de Casos',
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
  async function getChile() {
    const header = {
      headers: {
        Authorization: `Bearer ${state.token}`
      }
    }
    try {
      const {data: confirmed} = await fetch(UrlChile.confirmed, header).then(res => res.json())
      const {data: deaths} = await fetch(UrlChile.deaths, header).then(res => res.json())
      const {data: recovered} = await fetch(UrlChile.recovered, header).then(res => res.json())
      return { confirmed,deaths,recovered, }
    } catch (error) {
      console.log(error)
    }
  }
 async function init(){
    const jwt = localStorage.getItem('jwt-token')
    if(jwt){
      state.token = jwt;
      state.total = await getTotal();
      state.chile = await getChile()
      hideForm();
      showTable();
      drawGraphic(filterCountries(10000));
      changePoint();
    }  
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
  async function submitListener(e){
    e.preventDefault();
    await login()
    init()
  }
  function filterCountries(param){
    return state.total.filter(country => country.active > param)
  }
  function drawGraphic(paises){
  const confirmados = paises.map(pais => ({label: pais.location, y: pais.confirmed}));
  const recuperados = paises.map(pais => ({label: pais.location, y: pais.recovered}));
  const muertos = paises.map(pais => ({label: pais.location, y: pais.deaths}));
  const activos = paises.map(pais => ({label: pais.location, y: pais.active}));
 
  const chart = new CanvasJS.Chart("chartContainerBody", {
      animationEnabled: true,
      title:{
          text: " Global Covid 19"
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
  function changePoint(){
    $('#active-chile').click(async () => {
      drawingChileanGraphic(state.chile);
      $('.chilean').show()
      $('.home').hide()
    })
    $('#active-home').click(() => {
      $('.chilean').hide()
      $('.home').show()
    })
    $('#log-out').click(() => {
      localStorage.removeItem('jwt-token')
      location.reload();
      console.log('log out')
    })
  }
  function drawingChileanGraphic(data){
    const confirmados = data.confirmed.map(obj => ({x: new Date(obj.date), y: obj.total}))
    const muertos = data.deaths.map(obj => ({x: new Date(obj.date), y: obj.total}))
    const recuperados = data.recovered.map(obj => ({x: new Date(obj.date), y: obj.total}))
    const chart = new CanvasJS.Chart("chartContainerEsp", {
      animationEnabled: true,
      title:{
        text: "Covid 19 Chile"
      },
      axisX: {
        valueFormatString: "DD MM,YY"
      },
      axisY: {
        title: "",
        suffix: ""
      },
      legend:{
        cursor: "pointer",
        fontSize: 16,
        itemclick: toggleDataSeries
      },
      toolTip:{
        shared: true
      },
      data: [{
        name: "Casos Confirmados",
        type: "spline",
        yValueFormatString: "",
        showInLegend: true,
        dataPoints: confirmados
      },
      {
        name: "Casos Muertos",
        type: "spline",
        yValueFormatString: "",
        showInLegend: true,
        dataPoints: muertos
      },
      {
        name: "Casos Recuperados",
        type: "spline",
        yValueFormatString: "",
        showInLegend: true,
        dataPoints: recuperados
      }]
    });
    chart.render();
    
    function toggleDataSeries(e){
      if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
      }
      else{
        e.dataSeries.visible = true;
      }
      chart.render();
    }
    
  }
  return { init, state }  
})();
covid19.init();