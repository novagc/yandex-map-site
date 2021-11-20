const requests = {
    points: {
        State       : async (      ) => await SendGetRequest ('/points/state'),
        Get         : async (      ) => await SendGetRequest ('/points'),
        Add         : async (point ) => await SendPostRequest('/points/add', point),
        Update      : async (point ) => await SendPostRequest('/points/update', point),
        Delete      : async (point ) => await SendPostRequest('/points/delete', point),
        UpdateCoords: async (coords) => await SendPostRequest('/points/update/coords', coords)
    },
    marks : {
        State   : async (        ) => await SendGetRequest ('/marks/state'),
        Get     : async (        ) => await SendGetRequest ('/marks'),
        Add     : async (  mark  ) => await SendPostRequest('/marks/add', mark),
        Update  : async (  mark  ) => await SendPostRequest('/marks/update', mark),
        Delete  : async (  mark  ) => await SendPostRequest('/marks/delete', mark),
        AddType : async (id, type) => await SendPostRequest('/marks/types/add', {id, type})
    }
}

async function SendGetRequest(url, needOriginalResponse=false, responseInJson=true) {
    let response = await fetch(url);

    if (needOriginalResponse) {
        return response;
    }

    let data = responseInJson ? await response.json() : await response.text();
    return data;
} 

async function SendPostRequest(url, body, needOriginalResponse=false, responseInJson=false) {
    let response = await fetch(url, {
        headers : { 'Content-Type': 'application/json' },
        method  : 'POST',
        body    : JSON.stringify(body)
    });

    if (needOriginalResponse) {
        return response;
    }

    let data = responseInJson ? await response.json() : await response.text();

    return data;
}