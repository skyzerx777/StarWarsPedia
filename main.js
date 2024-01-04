$(document).ready(function () {
  showHint();
  $('.nav__link').click(chooseCategory);
  $('.search__button').click(search);
  $('.nav__logo').click(showHint);
});

async function chooseCategory(event) {
  event.preventDefault();
  $('.outputContainer').empty();
  $('.blurContainer').toggleClass('blured');
  $.get({
    url: $(this).attr('href'),
  }).done(function (result) {
    $('.blurContainer').toggleClass('blured');
    renderSearchResults(result);
  });
}

async function renderSearchResults(result) {
  let rendered = [];
  console.log(result.results);
  for (let item of result.results) {
    rendered.push(await renderItems(item));
  }
  $('.outputContainer').append(rendered);
  $('.found-item').click(checkFullInfo);
}

async function renderItems(item) {
  let renderedItem = `<div class="output__list-item"><a href="${item.url}" class="found-item">`;
  renderedItem += `${item?.name || item.title}</a></div>`;
  return renderedItem;
}

async function checkFullInfo(event) {
  event.preventDefault();
  $('.outputContainer').empty();
  $('.blurContainer').toggleClass('blured');
  $.get({
    url: $(this).attr('href'),
  }).done(async function (result) {
    let rendered = await renderFullItem(result);
    $('.blurContainer').toggleClass('blured');
    $('.outputContainer').append(rendered);
  });
}

async function renderFullItem(item) {
  let renderedItem = '<div class="output__item">';
  for (let key in item) {
    if (key === 'created') {
      break;
    }
    renderedItem += `<div class="output__line"><span class="bold">${
      key[0].toUpperCase() + key.slice(1).replaceAll('_', ' ')
    }:</span> ${
      item[key].toString() === [].toString()
        ? 'none'
        : await linkChecker(item[key])
    } <br></div>`;
  }
  return renderedItem + '</div>';
}

async function linkChecker(entity) {
  let result;
  if (Array.isArray(entity)) {
    result = await Promise.all(
      entity.map(async (item) => {
        return await subRequest(item);
      })
    ).catch(() =>
      console.log($('.outputContainer').append('<h2>Oops... Try again</h2>'))
    );
  } else {
    result = await subRequest(entity);
  }
  return result;
}

function subRequest(item) {
  const regexp = /^https:\/\/swapi.dev\/api\//;
  if (regexp.test(item)) {
    return new Promise((resolve) => {
      $.get({
        url: item,
      }).done(function (result) {
        resolve(result?.name || result.title);
      });
    });
  } else {
    return item;
  }
}

async function search(event) {
  event.preventDefault();
  $('.outputContainer').empty();
  if ($('.search__input').val() !== '') {
    $('.blurContainer').toggleClass('blured');

    const result = await $.get({
      url: `https://swapi.dev/api/${$('.search__select').val()}/?search=${$(
        '.search__input'
      ).val()}`,
    });
    $('.blurContainer').toggleClass('blured');
    if (result.count != 0) {
      renderSearchResults(result);
    } else {
      $('.outputContainer').append('<h2 class="error">Nothing found</h2>');
    }
  } else {
    console.log(
      $('.outputContainer').append(
        '<h2 class="error">You must enter something</h2>'
      )
    );
  }
}

function showHint() {
  $('.outputContainer').empty();
  $('.outputContainer').append(
    '<h1 class="hint">Enter something or choose category above</h1>'
  );
}
