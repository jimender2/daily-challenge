function initial() {
  const article = document.querySelector("section");

  if (article) {
    const badge = document.createElement("p");
    badge.textContent = `⏱️`;

    const button = document.createElement("button");
    button.id = "dailyChallenge";
    button.textContent = "Click me to take the unofficial daily challenge";
    button.setAttribute("style", "border-radius:20px");
    button.addEventListener("click", showQuestion);

    badge.appendChild(button);

    const heading = document.querySelector(".carousel-footer-container");

    heading.insertAdjacentElement("afterend", badge);
  }
}

function showQuestion() {
  if (document.querySelector("#dailyChallengeContainer") === null) {
    const challengeHTML = document.querySelector("#dailyChallenge");
    const challenge = document.createElement("p");
    challenge.textContent = "test";
    challenge.id = "dailyChallengeContainer";

    const questions = [
      {
        name: "choose an answer",
        options: [
          {
            name: "firstThis is really really really long",
            isCorrect: false,
          },
          {
            name: "second",
            isCorrect: false,
          },
          {
            name: "third",
            isCorrect: true,
          },
          {
            name: "fourth",
            isCorrect: false,
          },
        ],
      },
    ];

    var overalluser = "";
    fetchSessionJSON()
      .then((data) => {
        console.log(data);
        overalluser = data["current_user"]["username"];
        console.log(overalluser);
      })
      .then(() =>
        getJSONQuestion(overalluser).then((question) => {
          challenge.appendChild(createQuestion(question));

          challengeHTML.insertAdjacentElement("afterend", challenge);
        })
      );

    // challenge.appendChild(createQuestion(questions[0]));

    // challengeHTML.insertAdjacentElement("afterend", challenge);
  } else {
    const stuffToRemove = document.querySelector("#dailyChallengeContainer");
    stuffToRemove.remove();
  }
}

setTimeout(initial, 3000);

function getJSONQuestion(username) {
  var data = { user: username };

  formData = new FormData();
  for (const name in data) {
    formData.append(name, data[name]);
  }
  const response = fetch("https://challenge.jimender2.net/question", {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "no-cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    // body: JSON.stringify(data),
    body: formData,
  }).then((response) => {
    return response.json();
  });
}

async function postAnswerJSON(user, answer) {
  var data = { user: user, answer: answer };

  formData = new FormData();
  for (const name in data) {
    formData.append(name, data[name]);
  }

  const response = await fetch("https://challenge.jimender2.net/answer", {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "no-cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: formData,
  });
  const sessionJSON = await response.json();
  return sessionJSON;
}

async function fetchSessionJSON() {
  const response = await fetch("/session/current.json");
  const sessionJSON = await response.json();
  return sessionJSON;
}

const createOptionRadio = (name) => {
  const container = document.createElement("div");

  const input = document.createElement("input");
  input.type = "radio";
  input.className = "question-option";
  input.value = name;
  input.id = name;
  input.name = "question-option";
  input.addEventListener("click", unblockButton);

  const label = document.createElement("label");
  label.for = name;
  label.textContent = name[0].toUpperCase() + name.slice(1);

  container.appendChild(input);
  container.appendChild(label);

  return container;
};

const createQuestion = (questionObject) => {
  const container = document.createElement("div");
  container.className = "question-container";

  const h3 = document.createElement("h3");
  h3.textContent = questionObject.name;
  container.appendChild(h3);

  const form = document.createElement("form");
  const table = document.createElement("table");
  var ref = table.insertRow();
  var p = 0;
  questionObject.options.forEach(({ name }) => {
    p = p + 1;
    const cell = ref.insertCell();
    cell.appendChild(createOptionRadio(name));
    if (p === 2) {
      p = 0;
      ref = table.insertRow();
    }
  });

  var button = document.createElement("button");
  button.textContent = "Select Option";
  button.id = "dailyChallengeSubmit";
  button.setAttribute("style", "border-radius:20px");
  button.disabled = true;
  button.addEventListener("click", processForm);

  form.appendChild(table);
  container.appendChild(form);
  container.appendChild(button);

  return container;
};

function unblockButton() {
  var button = document.querySelector("#dailyChallengeSubmit");
  button.disabled = false;
  button.addEventListener("click", processForm);
  button.textContent = "Submit";
}

function processForm() {
  // we assume that they have selected an option
  const container = document.querySelector(".question-container");

  const form = container.querySelector("form");
  console.log(form);
  const value = form.querySelector(".question-option:checked").value;
  console.log(value);

  // Promises make the code look ugly
  var overallUser = "";
  fetchSessionJSON()
    .then((data) => {
      overallUser = data["current_user"]["username"];
    })
    .then(() => console.log(overallUser))
    .then(() => postAnswerJSON(overallUser, value));

  if (value === "third") {
    console.log("correct");
  }
}

function birthday() {
  // need to show that @sean (spiceworks) has a birthday every day
  const userInfo = document.querySelector(".user-info-list");

  if (userInfo === null) {
    // do nothing
  } else {
    const sean = document.createElement("div");
    sean.innerHTML =
      '<li class="user-info-item">\
        <div data-username="sean-spiceworks" id="ember364" class="user-info small ember-view">  <div class="user-image">\
    <div class="user-image-inner">\
      <a href="/u/sean-spiceworks" data-user-card="sean-spiceworks" aria-hidden="true"><img loading="lazy" alt="" width="48" height="48" src="https://sea1.discourse-cdn.com/spiceworks/user_avatar/community.spiceworks.com/sean-spiceworks/96/966454_2.png" class="avatar" title="Mace"></a>\
      <!---->\
    </div>\
  </div>\
<div class="user-detail">\
  <div class="name-line">\
      <a href="/u/sean-spiceworks" data-user-card="sean-spiceworks">\
        <span class="name">\
          Sean (Spiceworks)\
        </span>\
        <span class="username">\
          sean-spiceworks\
        </span>\
      </a>\
<!---->\
<!---->\
<!---->\
  </div>\
  <div class="title">Mace</div>\
    <div class="details">\
          <div>Today</div>\
    </div>\
</div>\
</div>\
      </li>';
    userInfo.appendChild(sean);
  }
}

setTimeout(birthday, 3000);
