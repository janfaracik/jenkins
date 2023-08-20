package hudson.widgets;

import java.util.List;

public class DetailsWidget<T> extends Widget {

    public List<DetailFactory> getDetailFactories() {
        return DetailFactory.all();
    }
}
