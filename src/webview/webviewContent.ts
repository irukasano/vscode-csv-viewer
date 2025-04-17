export function getWebviewContent(): string {
  const scriptContent = `
    let lastRows = [];
    let lastTitleRow = '';
    let currentStartIndex = 0;
    let currentEndIndex = 0;
    let currentCursorLine = -1;

    function highlightCell(row, col, doUpdate) {
        const table = document.getElementById('csv-table');
        if (!table) return;

        // **カーソルが現在の表示範囲外なら updateTable() を呼ぶ**
        if ( doUpdate) {
          if (row < currentStartIndex + 5 || row > currentEndIndex -5 ){
            updateTable(lastTitleRow, lastRows, row);
          }
        }

        // 既存のハイライトをリセット
        Array.from(table.getElementsByTagName('td')).forEach(cell => {
            cell.classList.remove('highlight');
        });

        const highlightRow = row;
        const targetRow = document.querySelector(\`tr[data-row="\${highlightRow}"]\`);
        console.log('targetRow = ', {row, highlightRow, currentStartIndex, currentEndIndex, targetRow});
        if (targetRow) {
          const cells = targetRow.getElementsByTagName("td");

          if (col >= 0 && col < cells.length) {
            // 指定セルをハイライト
            const targetCell = cells[col];

            // ハイライトを適用
            targetCell.classList.add('highlight');
          }
        }
    }

    function updateTable(titleRow, rows, cursorLine) {
      const csvTitleRow = document.getElementById('csv-title-row');
      const csvBody = document.getElementById('csv-body');

      lastRows = rows;
      lastTitleRow = titleRow;
      csvTitleRow.innerHTML = '';
      if (titleRow) {
        titleRow.split(',').forEach(cell => {
            const th = document.createElement('th');
            th.textContent = cell.trim();
            csvTitleRow.appendChild(th);
        });
      }

      // **行の高さを取得**
      csvBody.innerHTML = '';
      requestAnimationFrame(() => {
        const firstRow = csvTitleRow;
        const rowHeight = firstRow ? firstRow.offsetHeight : 20;
        const viewportHeight = window.innerHeight;
        const visibleRowCount = Math.floor(viewportHeight / rowHeight) -2;

        // **カーソル行を中心に表示範囲を決定**
        let newStartIndex = Math.max(0, cursorLine - Math.floor(visibleRowCount / 2));
        let newEndIndex = Math.min(rows.length, newStartIndex + visibleRowCount);

        if (newEndIndex - newStartIndex < visibleRowCount) {
          newStartIndex = newEndIndex - visibleRowCount;
        }

        console.log("csvBody = ", { rowHeight, viewportHeight, visibleRowCount});

        currentStartIndex = newStartIndex;
        currentEndIndex = newEndIndex;
        currentCursorLine = cursorLine;

        console.log("Indexes = ", {currentStartIndex, currentEndIndex, currentCursorLine});

        for (let i = currentStartIndex; i < currentEndIndex; i++) {
          const rowElement = document.createElement("tr");
          rowElement.setAttribute("data-row", i);

          rows[i].forEach((cell) => {
            const td = document.createElement("td");
            const trimmedCell = cell.trim();

            // セルごとにスタイルを適用
            if (!isNaN(trimmedCell) && trimmedCell !== '') {
                td.classList.add('number'); // 数値の場合
            } else if (isValidDate(trimmedCell)) {
                td.classList.add('date'); // 日付の場合
            }

            td.textContent = trimmedCell;
            rowElement.appendChild(td);
          });
          csvBody.appendChild(rowElement);
        }
      });
    }

    // 日付判定関数
    function isValidDate(dateString) {
        const date = new Date(dateString);
        return !isNaN(date) && /^\\d{4}-\\d{2}-\\d{2}$/.test(dateString);
    }

    // WebView からのメッセージを受信
    window.addEventListener('message', event => {
        const message = event.data;
        if (message.type === 'update') {
            updateTable(message.title, message.rows, message.currentRow);
            // 描画直後に highlight を実行（タイミング確保）
            requestAnimationFrame(() => {
              if (msg.highlight) {
                highlightCell(msg.highlight.row, msg.highlight.col, msg.highlight.doUpdate);
              }
            });
        }
        if (message.type === 'highlight') {
            highlightCell(message.row, message.col, message.doUpdate);
        }
    });

  `;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CSV Viewer</title>
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
        }
        thead {
          position: sticky;
          top: 0;
          background-color: #0078d4; /* 濃い青色 */
          color: white; /* 文字色を白に */
          z-index: 1;
          text-align: center;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
        }
        th {
          text-align: left;
        }
        td.number {
          color: lemonchiffon;
          text-align: right; /* 数値は右寄せ */
        }
        td.date {
          color: lightcyan;
          text-align: center; /* 日付は中央揃え */
        }
        #table-container {
          overflow-y: auto;
          height: 100%;
        }
        .highlight {
          background-color: yellow;
          color: black !important;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div id="table-container">
        <table id="csv-table">
          <thead>
            <tr id="csv-title-row"></tr>
          </thead>
          <tbody id="csv-body"></tbody>
        </table>
      </div>
      <script>
        ${scriptContent}
      </script>
    </body>
    </html>
  `;
}
