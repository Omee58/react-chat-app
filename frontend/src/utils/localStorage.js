export function setLocalData(name, data) {
    const finalData = data ? JSON.stringify(data) : "";
    localStorage.setItem(name, finalData);
}

export function getLocalData(name) {
    const data = localStorage.getItem(name);
    return data ? JSON.parse(data) : "";
}