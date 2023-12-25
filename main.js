$(document).ready(function () {
  $('.nav__link').click(chooseCategory);
  $('.search__button').click(search);
  $('.nav__logo').click(function () {
    $('.outputContainer').empty();
  });
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
  for (let item of result.results) {
    rendered.push(await renderItems(item));
  }
  $('.outputContainer').append(rendered);
  $('.found-item').click(checkFullInfo);
}

async function renderItems(item) {
  let renderedItem = `<div class="output__item"><a href="${item.url}" class="found-item">`;
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
    renderedItem += `${
      key[0].toUpperCase() + key.slice(1).replaceAll('_', ' ')
    }: ${
      item[key].toString() === [].toString()
        ? 'none'
        : await linkChecker(item[key])
    } <br>`;
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
      $('.outputContainer').append('<h2>Nothing found</h2>');
    }
    renderSearchResults(result);
  } else {
    console.log(
      $('.outputContainer').append('<h2>You must enter something</h2>')
    );
  }
}
