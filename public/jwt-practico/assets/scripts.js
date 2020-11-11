$('form').submit(async(event)=>{
    event.preventDefault();
    const email = $('#exampleInputEmail1').val()
    const password = $('#exampleInputPassword1').val()
    const Token = await getToken(email, password)    

    console.log(Token)
})
async function getToken(email, password){
    try{
        const response = await fetch('http://localhost:3000/api/login',{
            method:'POST',
            body: JSON.stringify( { email: email, password: password } )
        })
        const { token } = await response.json()
        
        return token;
    }catch(err){
        console.log(err);
    }
}