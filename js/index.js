const API_KEY = "AIzaSyDCezF9PLVn7bxdMJkbgQAjQ17vboNjouw";
const CLIENT_ID =
  "321487162421-igt11j5vaknqkp2199bbhu9fh1gqcsro.apps.googleusercontent.com";
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
  "https://sheets.googleapis.com/$discovery/rest?version=v4",
  "https://docs.googleapis.com/$discovery/rest"
];
const SCOPES =
  "https://www.googleapis.com/auth/drive.metadata https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/spreadsheets";

const authorizeButton = document.getElementById("authorize_button");
const signoutButton = document.getElementById("signout_button");
const thead = document.getElementById("thead");
const tbody = document.getElementById("tbody");

const handleClientLoad = () => {
  gapi.load("client:auth2", initClient);
};

const initClient = () => {
  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    })
    .then(
      () => {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
      },
      error => {
        // appendPre(JSON.stringify(error, null, 2));
      }
    );
};

const updateSigninStatus = isSignedIn => {
  if (isSignedIn) {
    authorizeButton.style.display = "none";
    signoutButton.style.display = "block";
    listFiles();
  } else {
    authorizeButton.style.display = "block";
    signoutButton.style.display = "none";
  }
};

const handleAuthClick = event => {
  gapi.auth2.getAuthInstance().signIn();
};

const handleSignoutClick = event => {
  window.location.reload();
  gapi.auth2.getAuthInstance().signOut();
};

const listFiles = () => {
  gapi.client.drive.files
    .list({
      pageSize: 10,
      fields: "nextPageToken, files(id, name)"
    })
    .then(({ result }) => {
      // appendPre("Files:");
      const { files } = result;

      if (files && files.length > 0) {
        files.forEach(({ name, id }) => {
          switch (name) {
            case "Тестовое задание JS":
              tableSheetList(id);
              break;
            case "Компетенции":
              printDocTitle(id);
              break;

            default:
              break;
          }
        });
      } else {
        // appendPre("No files found.");
      }
    });
};

const printDocTitle = documentId => {
  gapi.client.docs.documents
    .get({
      documentId
    })
    .then(
      response => {
        console.log(response.result.body.content[2].table);

        const doc = response.result;
        const title = doc.title;
        // appendPre('Document "' + title + '" successfully found.\n');
      },
      response => {
        // appendPre("Error: " + response.result.error.message);
      }
    );
};

const tableSheetList = id => {
  gapi.client.sheets.spreadsheets.values
    .get({
      spreadsheetId: id,
      range: "Лист1"
    })
    .then(
      ({ result }) => {
        if (result.values.length > 0) {
          result.values.forEach((data, i) => {
            const parentNode = document.createElement("tr");

            data.forEach(el => {
              if (i === 0) {
                const node = document.createElement("th");
                const textnode = document.createTextNode(el);
                node.appendChild(textnode);
                thead.appendChild(node);
              } else {
                const childNode = document.createElement("td");
                const textnode = document.createTextNode(el);

                childNode.appendChild(textnode);
                parentNode.appendChild(childNode);
              }
            });
            tbody.appendChild(parentNode);
          });
        } else {
          // appendPre("No data found.");
        }
      },
      response => {
        // appendPre("Error: " + response.result.error.message);
      }
    );
};

$("table").on("scroll", function() {
  $("#" + this.id + " > *").width($(this).width() + $(this).scrollLeft());
});
