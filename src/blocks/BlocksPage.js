import React from 'react';

import {api} from '../shared/NodeApi';
import Error from '../shared/Error';
import Pagination from './Pagination';
import BlockList from './BlockList';

const BLOCKS_PER_PAGE = 20;

export default class BlocksPage extends React.Component {

    state = {
        height: 0,
        currentPage: 1,
        lastPage: 10,
        blocks: [],
        hasError: false
    };

    componentDidMount() {
        api.blocks.height().then(heightResponse => {
            const height = heightResponse.data.height;
            const lastPage = Math.ceil(height / BLOCKS_PER_PAGE);

            this.setState({height, lastPage}, () => this.loadCurrentPage(this.state.currentPage));
        }).catch(error => {
            console.error(error);

            this.setState({hasError: true})
        });
    }

    loadCurrentPage = (pageNumber) => {
        const from = Math.max(1, this.state.height - pageNumber * BLOCKS_PER_PAGE + 1);
        const to = Math.min(this.state.height, from + BLOCKS_PER_PAGE);

        api.blocks.headers.sequence(from, to).then(blocksResponse => {
            const blocks = blocksResponse.data.map(block => {
                return {
                    height: block.height,
                    timestamp: block.timestamp,
                    baseTarget: block['nxt-consensus']['base-target'],
                    generator: block.generator,
                    signature: block.signature,
                    transactions: block.transactionCount
                };
            }).reverse();

            this.setState({blocks});
        }).catch(error => {
            console.error(error);

            this.setState({hasError: true})
        });
    };

    handlePageChange = pageNumber => {
        this.loadCurrentPage(pageNumber);
    };

    render() {
        if (this.state.hasError) {
            return <Error title="Failed to load blocks" />;
        }

        return (
            <React.Fragment>
                <div className="headline">
                    <span className="title">Blocks</span>
                    <Pagination currentPage={this.state.currentPage} lastPage={this.state.lastPage}
                                onPageChange={this.handlePageChange} />
                </div>
                <BlockList blocks={this.state.blocks} />
            </React.Fragment>
        );
    }
}
