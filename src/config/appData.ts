const frontEnd = process.env.NODE_ENV === "development" ? 'http://localhost:8080/fuml/' : 'https://bogsynth.com/fuml/';

const appData = {
    frontEndUrl: frontEnd
}

export default appData;