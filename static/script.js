async function getCupcakes() {
  // Get all cupcakes in DB and display them on index page
  const response = await axios.get("/api/cupcakes");
  for(cc of response.data.cupcakes) {
    const $row = $('<div class="row cupcake"></div>');
    const $col_pic = $('<div class="col cc-pic"></div>');
    const $col_details = $('<div class="col cc-details-list"></div>');
    
    const $pic = $(`<img class="img-fluid" src="${cc.image}" id="${cc.id}" alt="cupcake pic" height="200">`)
      .on("click", async (evt) => {
        await getCupcake(evt.target.id);
        window.location.replace("/cupcake");
    })

    $col_pic.append($pic);
    $col_details.append([`<p><b>Flavor:</b> ${cc.flavor}</p`,
                         `<p><b>Size:</b>   ${cc.size}</p`,
                         `<p><b>Rating:</b> ${cc.rating}</p`]);
    $row.append([$col_pic, $col_details]);
    $('.cupcakes').append($row);
  }
}

async function getCupcake(id) {
  // Get chosen cupcake from DB and store in session storage
  const response = await axios.get(`/api/cupcakes/${id}`);
  cc = response.data.cupcake;
  storeCupcake(cc)
}

function storeCupcake(cc) {
  // Store each property of cupcake because
  // I couldn't access the properties after storing the whole object
  sessionStorage.setItem("id", cc.id);
  sessionStorage.setItem("flavor", cc.flavor);
  sessionStorage.setItem("size", cc.size);
  sessionStorage.setItem("rating", cc.rating);
  sessionStorage.setItem("image", cc.image);
}

function showCupcake() {
  // Get cupcake from storage and insert property values into page
  flavor = sessionStorage.getItem("flavor");
  size = sessionStorage.getItem("size");
  rating = sessionStorage.getItem("rating");
  image = sessionStorage.getItem("image");
  console.log(flavor, size, rating, image);
  $('#cc-flavor').val(flavor);
  $('#cc-size').val(size);
  $('#cc-rating').val(rating);
  $('#cc-image').val(image);
  $pic = $(`<img class="img-fluid" src="${image}" alt="cupcake pic" height="200">`).attr('src', image);
  $('.cc-pic').append($pic);
}

async function postNewCupcake() {
  // Create new cupcake in DB
  flavor = $('#form-cc-flavor').val();
  size = $('#form-cc-size').val();
  rating = $('#form-cc-rating').val();
  image = $('#form-cc-image').val();
  console.log(flavor, size, rating, image);
  try {
    response = await axios.post('/api/cupcakes', {
      "flavor": flavor,
      "size": size,
      "rating": rating,
      "image": image
    });
    return true;
  }
  catch(error) {
    console.log(error);
    alert(error);
  }
  return false;
}

async function editCupcake() {
  // Edit cupcake in DB using PATCH request
  // Then store updated cupcake in session storage
  flavor = $('#cc-flavor').val();
  size = $('#cc-size').find(":selected").text();
  rating = $('#cc-rating').val();
  image = $('#cc-image').val();
  console.log(flavor, size, rating, image);
  try {
    response = await axios({
      url: `/api/cupcakes/${sessionStorage.getItem("id")}`,
      method: 'PATCH',
      data: {"flavor":flavor, "size":size, "rating":rating, "image":image}
    });
    console.log(response.data.cupcake);
    storeCupcake(response.data.cupcake);
    return true;
  }
  catch(error) {
    console.log(error);
    alert(error);
  }
  return false;
}

async function deleteCupcake() {
  id = sessionStorage.getItem("id");
  try {
    response = await axios.delete(`/api/cupcakes/${id}`);
    console.log(response.data);
    return true;
  }
  catch(error) {
    console.log(error);
    alert(error);
  }
  return false;
}

// New cupcake form on index page
$('.btn-add-cc').on("click", async (evt) => {
  console.log(evt.target);
  evt.preventDefault();
  cc = await postNewCupcake();
  if (cc === true)
    location.reload();
})

// Edit button on view cupcake page
$('.btn-edit-cc').on("click", (evt) => {
  evt.preventDefault();
  window.location.replace("/cupcake/edit");
});

// Back button on view cupcake page
$('.btn-edit-back').on("click", (evt) => {
  evt.preventDefault();
  window.location.replace("/");
});

// Submit button on edit cupcake page
$('.btn-edit-form-submit').on("click", async (evt) => {
  evt.preventDefault();
  cc = await editCupcake();
  if (cc === true)
    window.location.replace("/cupcake");
});

// Back button on edit cupcake page
$('.btn-edit-form-back').on("click", (evt) => {
  evt.preventDefault();
  window.location.replace("/cupcake");
});

// Delete button on edit cupcake page
$('.btn-edit-form-delete').on("click", async function() {
  if (await deleteCupcake())
    window.location.replace("/")
});

// Once DOM has loaded, get all cupcakes if on index page
// Otherwise on view or edit page, show cupcake chosen
$(window).on("load", () => {
  if (window.location.href == "http://127.0.0.1:5000/")
    getCupcakes();
  else
    showCupcake();
});