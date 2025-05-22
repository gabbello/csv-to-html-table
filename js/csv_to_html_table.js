var CsvToHtmlTable = CsvToHtmlTable || {};

CsvToHtmlTable = {
    init: function (options) {
        options = options || {};
        var csv_path = options.csv_path || "";
        var csv_text = options.csv_text || null;
        var el = options.element || "table-container";
        var allow_download = options.allow_download || false;
        var csv_options = options.csv_options || {};
        var datatables_options = options.datatables_options || {};
        var custom_formatting = options.custom_formatting || [];
        var customTemplates = {};
        $.each(custom_formatting, function (i, v) {
            var colIdx = v[0];
            var func = v[1];
            customTemplates[colIdx] = func;
        });

        var $table = $("<table class='table table-striped table-condensed' id='" + el + "-table'></table>");
        var $containerElement = $("#" + el);
        $containerElement.empty().append($table);

        function renderTable(data, downloadLink) {
            var csvData = $.csv.toArrays(data, csv_options);
            var $tableHead = $("<thead></thead>");
            var csvHeaderRow = csvData[0];
            var $tableHeadRow = $("<tr></tr>");
            for (var headerIdx = 0; headerIdx < csvHeaderRow.length; headerIdx++) {
                $tableHeadRow.append($("<th></th>").text(csvHeaderRow[headerIdx]));
            }
            $tableHead.append($tableHeadRow);

            $table.append($tableHead);
            var $tableBody = $("<tbody></tbody>");

            for (var rowIdx = 1; rowIdx < csvData.length; rowIdx++) {
                var $tableBodyRow = $("<tr></tr>");
                for (var colIdx = 0; colIdx < csvData[rowIdx].length; colIdx++) {
                    var $tableBodyRowTd = $("<td></td>");
                    var cellTemplateFunc = customTemplates[colIdx];
                    if (cellTemplateFunc) {
                        $tableBodyRowTd.html(cellTemplateFunc(csvData[rowIdx][colIdx]));
                    } else {
                        $tableBodyRowTd.text(csvData[rowIdx][colIdx]);
                    }
                    $tableBodyRow.append($tableBodyRowTd);
                }
                $tableBody.append($tableBodyRow);
            }
            $table.append($tableBody);
            $table.DataTable(datatables_options);
            if (allow_download && downloadLink) {
                $containerElement.append("<p><a class='btn btn-info' href='" + downloadLink + "' download><i class='glyphicon glyphicon-download'></i> Download as CSV</a></p>");
            }
        }

        if (csv_text) {
            renderTable(csv_text, null);
        } else if (csv_path) {
            $.when($.get(csv_path)).then(function (data) {
                renderTable(data, csv_path);
            });
        }
    }
};
