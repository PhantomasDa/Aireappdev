function fetchData(url, options = {}) {
    options.headers = {
        ...options.headers,
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    };
    return fetch(url, options).then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message || response.statusText);
            }).catch(() => {
                throw new Error(response.statusText);
            });
        }
        return response.json();
    });
}
