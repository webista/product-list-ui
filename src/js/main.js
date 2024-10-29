/*!
 * main.js
 */
document.addEventListener("DOMContentLoaded", () => {
  const productsTabsButtons = document.querySelectorAll("#js-products-tabs .js-fetchData");
  const productsContainer = document.getElementById("js-products");

  if (productsTabsButtons.length) {
    // The first product tab is loaded immediately
    fetchData(null, productsTabsButtons[0].href);

    // Other product tabs are loaded on click event
    productsTabsButtons.forEach((btn) => {
      btn.addEventListener("click", fetchData);
    });
  }

  function fetchData(ev, url) {
    const loader = `<span class="Loader"></span>`;
    const errorText = "We're sorry. Products could not be loaded.";
    let fetchButton;
    let dataURL;

    productsContainer.innerHTML = loader;

    if (ev) {
      ev.preventDefault();
      fetchButton = ev.target;
      dataURL = fetchButton.href;
    } else {
      dataURL = url;
    }

    const checkError = (response) => {
      if (response.status >= 200 && response.status <= 299) {
        return response.json();
      } else {
        throw Error(response.status);
      }
    };

    const handleError = (error) => {
      console.warn(error.message);
      productsContainer.innerHTML = `<p class="Alert Alert--error">${errorText}</p>`;
    };

    const handleData = (data) => {
      renderProducts(data);
    };

    fetch(dataURL).then(checkError).then(handleData).catch(handleError);
  }

  function renderProducts(data) {
    let productsHTML = `<ul class="Products">`;
    data.forEach((product) => {
      productsHTML += `<li class="ProductCard">
          <div class="ProductCard-topSection">
            <picture class="ProductCard-imgContainer">
              <source srcset="${product.img[0]} 1x, ${product.img[1]} 2x" />
              <img class="ProductCard-img" src="${product.img[0]}" width="274" height="274" alt="${product.name}" loading="lazy" />
            </picture>
            <h2 class="ProductCard-title">
              <a href="#" class="Link Link--inverted Link--stretched" title="${product.name}">${product.name}</a>
            </h2>
            <p class="ProductCard-desc">${product.desc}</p>
          </div>
          <div class="ProductCard-bottomSection">
            <div class="ProductCard-ratingSection">
              <div class="ProductCard-rating">
                <span class="ProductCard-ratingStars" style="width: ${product.rating * 20}%"></span>
              </div>
              <span class="ProductCard-ratingValue">${product.rating}</span>
            </div>
            <a href="#" class="ProductCard-reviews" title="Show product ${product.reviews > 1 ? "reviews" : "review"}">${product.reviews} ${product.reviews > 1 ? "reviews" : "review"}</a>
            <span class="ProductCard-price">${product.price}</span>
            <button type="button" class="Button u-width-100p">Add to Cart</button>
          </div>
        </li>`;
    });
    productsHTML += `</ul>`;
    productsContainer.innerHTML = productsHTML;
  }
});
