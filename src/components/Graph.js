import React, { Component } from "react";
import ResponsiveBarChart from './ResponsiveBarChart';
import  {connect} from "react-redux"
import {authenticateUser} from "../state/actions"
import * as Utils from '../graphql_utils/utils'
import LogCard from "./LogCard";
import PropTypes from 'prop-types';


/**
 * Component that accepts a processId, fetches its data and displays its information
 *  
 */
class Graph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spec: this.spec,
            // chartData: this.data,
        };
    }

    /**
     * Loads the data related to the BarChart and data related to the Logs in a Process
     * 
     * @param {string} process_id The id of the Process
     */
    load_process_data(process_id) {
        this.load_chart_data(process_id);
        this.load_log_data(process_id);
    }
    componentDidMount() {
        if (this.props.processId) this.load_process_data(this.props.processId)
    }

    componentDidUpdate(prevProps) {
        if (this.props.updateComponent) {
            this.load_process_data(this.props.processId)
            this.props.updateHandler("")
        }
        // console.log('graph update')
        // if(prevProps !== this.props) {
        //     console.log('update')
        //     this.setState(this.props.processId)
        // }
    }
    /**
     * Converts a number in milliseconds to hours
     * 
     * @param {number} t The number of milliseconds
     * @return {number} The milliseconds converted to hours
     */
    msToHours(t) {
       const s = t/1000;
       const m = s/60;
       const h = m/60
       return h;
    }

    /**
     * Loads the Phase duration data for the BarChart and saves to state
     * 
     * @param {string} process_id The id of the Process
     */
    load_chart_data(process_id) {
        this.setState({
            loading: true
        });
        Utils.getProcess(process_id).then(res => {
            const phases = res.data.getProcess.phaseids.items;
            const items = phases.map(phase => {
                return {
                    category: phase.title,
                    amount: this.msToHours(phase.duration).toFixed(2)
                    // amount: phase.duration
                }
            })
            this.setState({
                loading: false,
                chartData: {
                    table: items
                }
            })
        })
    }

    /**
     * Loads the Phase Logs data and saves to state
     * 
     * @param {string} process_id The id of the Process
     */
    load_log_data(process_id) {
        this.setState({
            loading: true
        });
        Utils.getProcess(process_id).then(res => {
            const phase_ids = res.data.getProcess.phaseids.items.map(phase => {
                return phase.id
            });
            Promise.all(phase_ids.map(phase_id => {
                return Utils.getPhase(phase_id).then(res => { 
                    const phase = res.data.getPhase;
                    const logs = phase.logs.items;
                    logs.sort((a, b) => {
                        return a.timestamp - b.timestamp;
                    })
                    return {
                        phase_id: phase.id,
                        title: phase.title,
                        log_ids: logs
                    };
                });
            })).then(phase_logs => {
                this.setState({
                    loading: false,
                    selected_process_phase_logs: phase_logs
                });         
            });
        })
    }
    /**
     * Sends a request to delete a Log, using Utils.deleteLogs()
     * Reloads all Logs again
     * 
     * @param {string} log_id The id of the Log
     */
    deleteLogHandler = (log_id) => {
        this.setState({
            loading: true
        });
        Utils.deleteLogs(log_id).then(res => {
            this.setState({
                loading: false
            });
            this.load_log_data(this.props.processId)
        })
    }

    /**
     * Sends a request to update a Log, using Utils.updateLogs()
     * Reloads all Logs again.
     * 
     * @param {string} log_id The id of the Log
     */
    updateLogHandler = (log_id, timestamp, text) => {
        this.setState({
            loading: true
        })
        // don't send empty strings
        text = text ? text : '(blank entry)';
        Utils.updateLogs(log_id, timestamp, text).then(res => {
            this.setState({loading: false})
            this.load_log_data(this.props.processId)
        })
    }

    /**
     * Renders a LogCard for each of the Logs loaded into state
     */
    process_logs_render = () => {
        // combine all logs from all phases
        const data = this.state.selected_process_phase_logs
            ?   this.state.selected_process_phase_logs.reduce((arr, phase) => {
                    // console.log(phase)
                    const logs = phase.log_ids.map(log => {
                        return {
                            phase_title: phase.title,
                            id: log.id,
                            timestamp: log.timestamp,
                            text: log.text
                        }
                    })  
                    arr.push(...logs);
                    return arr;
                }, []).sort((a, b) => {
                    return a.timestamp - b.timestamp;
                })
            :   null;
        return data
            ?   <div className={''}>
                    {data.map(log => {
                        return( 
                            <LogCard 
                                key={log.id} 
                                logId={log.id}
                                phaseTitle={log.phase_title}
                                timestamp={log.timestamp}
                                text={log.text}
                                deleteHandler={this.deleteLogHandler} 
                                updateHandler={this.updateLogHandler}
                            />
                        )
                    })}
                </div>
            :   null;
    }

    /**
     * Renders the ResponsiveBarChart for the loaded chart data in state
     */
    bar_chart_render = () => {
        return this.state.chartData
            ? <ResponsiveBarChart data={this.state.chartData} />
            : null;
    }
    /**
     * Displays a spinner in the middle of the screen, while the loading key in state is true
     */
    loading_render = () => {
        const style = {
            position: 'fixed',
            zIndex: '1020',
            top: '50%',
            left: '50%',
            width:'5em',
            height: '5em',
            marginTop: '-2.5em',
            marginLeft: '-2.5em'
        }
        return (this.state.loading
            ? <div style={style} className={'spinner-grow text-info'}></div>
            : null
        );
    }

    render() {
        return (
            <div className='container'>
                {this.loading_render()}
                {this.bar_chart_render()}
                {this.process_logs_render()}
            </div>
        );
    }

    // data = {
    //     table : [
    //         {"category": "A", "amount": 28},
    //         {"category": "B", "amount": 55},
    //         {"category": "C", "amount": 43},
    //         {"category": "D", "amount": 91},
    //         {"category": "E", "amount": 81},
    //         {"category": "F", "amount": 53},
    //         {"category": "G", "amount": 19},
    //         {"category": "H", "amount": 87},
    //         {"category": "I", "amount": 23}
    //     ]
    // }
}

Graph.propTypes = {
    processId: PropTypes.string.isRequired,
};

// const mapStateToProps = ({state}) => ({
//     isAuthenticated: state.isAuthenticated,
//     user: state.user
// })
// const mapDispatchToProps = dispatch => ({
//     authenticateUser: (auth) => dispatch(authenticateUser(auth))
// })

// export default connect(mapStateToProps, mapDispatchToProps)(Graph);
export default Graph;
