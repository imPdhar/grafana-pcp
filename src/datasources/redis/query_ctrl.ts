import { PCPQueryCtrl } from '../lib/pcp_query_ctrl';
import PCPRedisCompleter from './completer';
import { getDashboardVariables } from '../lib/utils';
import { TargetFormat } from '../lib/models/datasource';
import loadPmseriesMode from './mode-pmseries';

export class PCPRedisDatasourceQueryCtrl extends PCPQueryCtrl {
    static templateUrl = 'datasources/redis/partials/query.editor.html';

    formats: any = [];

    /* @ngInject */
    constructor($scope: any, $injector: any, private variableSrv: any) {
        super($scope, $injector);

        this.target.expr = this.target.expr || "";
        this.target.format = this.target.format || this.getDefaultFormat();

        this.formats = [
            { text: "Time series", value: TargetFormat.TimeSeries },
            { text: "Table", value: TargetFormat.MetricsTable },
            { text: "Heatmap", value: TargetFormat.Heatmap },
        ];
    }

    getDefaultFormat() {
        if (this.panelCtrl.panel.type === 'table')
            return TargetFormat.MetricsTable;
        else if (this.panelCtrl.panel.type === 'heatmap')
            return TargetFormat.Heatmap;
        else
            return TargetFormat.TimeSeries;
    }

    getCompleter() {
        this.removeTextCompleter("pmseries");
        loadPmseriesMode();
        const dashboardVariables = Object.keys(getDashboardVariables(this.variableSrv));
        return new PCPRedisCompleter(this.datasource, dashboardVariables);
    }

}
