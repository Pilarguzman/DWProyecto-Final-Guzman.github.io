const cards = document.getElementById('cards')
const items = document.getElementById('items')
const footer = document.getElementById('footer')
const templateCard = document.getElementById('template-card').content
const templateFooter = document.getElementById('template-footer').content
const templateCarrito = document.getElementById('template-carrito').content
const fragment = document.createDocumentFragment()
let carro = {}

// Eventos
document.addEventListener('DOMContentLoaded', e => { 
    fetchData() 
    if (localStorage.getItem('carro')) {
        carro = JSON.parse(localStorage.getItem('carro'))
        llamarCarrito()
    }
});

cards.addEventListener('click', e => { 
    addCarrito(e) 
});

items.addEventListener('click', e => { 
    btnAccion(e) 
})

// Traer productos
const fetchData = async () => {
    const res = await fetch('app.json');
    const data = await res.json()
    // console.log(data)
    llamarCards(data)
}

// Llamar productos
const llamarCards = data => { 
    data.forEach(item => {  //producto => {
        templateCard.querySelector('h6').textContent = item.nombre //producto.nombre
        templateCard.querySelector('del').textContent = item.del
        templateCard.querySelector('p').textContent = item.precio
        templateCard.querySelector('img').setAttribute("src", item.imagen)
        templateCard.querySelector('button').dataset.id = item.id // .btn-secondary

        const clone = templateCard.cloneNode(true)
        fragment.appendChild(clone)
    })
    cards.appendChild(fragment)
}

// Agregar al carrito
const addCarrito = e => {
    // console.log(e.target)

    if (e.target.classList.contains('btn-secondary')) {
        setCarrito(e.target.parentElement)

        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })
          
          Toast.fire({
            icon: 'success',
            title: 'Producto agregado correctamente'
          })
    }
    e.stopPropagation()
}

const setCarrito = item => {
    // console.log(item)
    const producto = {
        nombre: item.querySelector('h6').textContent,
        precio: item.querySelector('p').textContent,
        id: item.querySelector('button').dataset.id,
        cantidad: 1
    }

    if(carro.hasOwnProperty(producto.id)) {
        producto.cantidad = carro[producto.id].cantidad + 1
    }

    carro[producto.id] = { ...producto }

    llamarCarrito()
    // console.log(producto)
}

const llamarCarrito = () => {
    // console.log(carro)
    items.innerHTML = ''
    Object.values(carro).forEach(producto => {
        templateCarrito.querySelector('th').textContent = producto.id
        templateCarrito.querySelectorAll('td')[0].textContent = producto.title
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad
        templateCarrito.querySelector('span').textContent = producto.precio * producto.cantidad
        
        //botones
        templateCarrito.querySelector('.btn-success').dataset.id = producto.id
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id

        const clone = templateCarrito.cloneNode(true)
        fragment.appendChild(clone)
    })
    items.appendChild(fragment)

    llamarFooter()

    localStorage.setItem('carro', JSON.stringify(carro))
}

const llamarFooter = () => {
    footer.innerHTML = ''
    if (Object.keys(carro).length === 0) {
        footer.innerHTML = `
            <th class="text-success" scope="row" colspan="5">Carrito vacío</th>
        `;
        return;
    }

    // Sumar cantidad y totales
    let totalCantidad = 0;
    let totalPrecio = 0;

    Object.values(carro).forEach(producto => {
        const cantidad = producto.cantidad;
        const precio = parseFloat(producto.precio);

        totalCantidad += cantidad;
        totalPrecio += cantidad * precio;
    });

    templateFooter.querySelectorAll('td')[0].textContent = totalCantidad;
    templateFooter.querySelector('span').textContent = totalPrecio.toFixed(2);

    const clone = templateFooter.cloneNode(true);
    fragment.appendChild(clone);

    footer.appendChild(fragment);

    const btnVaciarCarro = document.getElementById('vaciar-carrito');
    btnVaciarCarro.addEventListener('click', () => {
        carro = {};
        llamarCarrito();
    });

    const btnFinalizarCompra = document.getElementById('comprar-carrito'); //* */
    btnFinalizarCompra.addEventListener('click', finalizarCompra)
};

const btnAccion = e => {
    console.log(e.target)
    // Aumentar
    if (e.target.classList.contains('btn-success')) {
        // console.log(carro[e.target.dataset.id])
        const producto = carro[e.target.dataset.id]
        producto.cantidad = carro[e.target.dataset.id].cantidad + 1
        carro[e.target.dataset.id] = { ...producto }
        llamarCarrito()
    }
    
    //Disminuir
    if (e.target.classList.contains('btn-danger')) {
        const producto = carro[e.target.dataset.id]
        producto.cantidad--
        if(producto.cantidad === 0) {
            delete carro[e.target.dataset.id]
        } 
        llamarCarrito()
    }

    e.stopPropagation()
}

const finalizarCompra = () => {
    // Mostrar mensaje de compra finalizada
    Swal.fire({
        title: '¡Compra finalizada!',
        text: 'Gracias por tu compra.',
        icon: 'success',
        confirmButtonText: 'Continuar comprando',
        confirmButtonColor: '#28a745',
      })

    // Limpiar el carrito
    carro = {}
    llamarCarrito()
}


