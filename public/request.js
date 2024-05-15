function cheatDetectedApi(url, userId, examId, timestamp) {
    const body = {
        userId: userId,
        examId: examId,
        timestamp: timestamp
    }
    fetch(`${url}/record/cheat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // 解析 JSON 格式的响应数据
      })
      .then(data => {
        console.log(data); // 处理返回的数据
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      })
    }