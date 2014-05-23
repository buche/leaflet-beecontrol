/**
 * This file is licensed under Creative Commons Zero (CC0)
 * http://creativecommons.org/publicdomain/zero/1.0/
 * Author: http://www.openstreetmap.org/user/Zartbitter
 */

L.Control.Permalink.include({

	initialize_beecontrol: function() {
		this.on('update', this._set_beecontrol, this);
		this.on('add', this._onadd_beecontrol, this);
	},

	_onadd_beecontrol: function(e) {
		this._map.on('beecontrolchanged', this._update_beecontrol, this);
		this._update_beecontrol();
	},

	_update_beecontrol: function() {
		// remove old style parameters
		if (this._params.mlat) {
			delete this._params.m;
			delete this._params.r1;
			delete this._params.r2;
			delete this._params.c1;
			delete this._params.c2;
			delete this._params.mlat;
			delete this._params.mlon;
		}

		// add new style parameters
		var bind = this.options.beeControl._permalinkseparator || "'";
		var bees = this.options.beeControl._bees;
		var cnt = 0;
		var params = {};
		for (var beeidx in bees) {
			if (bees.hasOwnProperty(beeidx) && beeidx.match(/^bee\d+$/)) {
				delete this._params[beeidx.replace(/ee/, '')];
				if (bees[beeidx].centerChecked || bees[beeidx].innerChecked || bees[beeidx].outerChecked) {
					// add bee data to permalink
					var bee = bees[beeidx];
					var pstr = bee.centerChecked ? '1' + bind : '0' + bind;
					if (bee.center) {
						var c = this._round_point(bee.center);
						pstr += c.lat + bind + c.lng + bind;
					} else {
						pstr += bind + bind;
					}
					pstr += bee.innerChecked ? '1' + bind : '0' + bind;
					pstr += bee.innerRadius + bind;
					pstr += bee.outerChecked ? '1' + bind : '0' + bind;
					pstr += bee.outerRadius + bind;
					pstr += bee.innerColor.replace(/#/, '') + bind;
					pstr += bee.outerColor.replace(/#/, '');
					cnt++;
					params['b' + cnt] = pstr;
				}
			}
		}
		this._update(params);
	},

	_set_beecontrol: function(e) {
		this._map.fire("updatebeecontrol", {params: this._params});
	}
});

