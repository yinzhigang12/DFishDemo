/* echarts
 * {type: 'echarts', option: {}}
 */

var echarts = require( './echarts.min' );

define.widget( 'echarts', {
	Listener: {
		body: {
			ready: function() {
				(this.echarts = echarts.init( this.$() )).setOption( this.x.option );
			}
		}
	}
} );
