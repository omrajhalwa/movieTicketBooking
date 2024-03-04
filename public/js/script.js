// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
    'use strict'
  console.log("om");
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
  
        form.classList.add('was-validated')
      }, false)
    })
  })();


  function addMoreDates(){
    let newNode=document.createElement("input");
    newNode.classList.add("form-control");
    newNode.classList.add("mt-2");
    newNode.setAttribute("type","date");
    newNode.setAttribute("name","listing[availableDate]");

    let myform=document.getElementById("myform");
    let submitButton=document.getElementById("submitButton");

    myform.insertBefore(newNode,submitButton);
  }

