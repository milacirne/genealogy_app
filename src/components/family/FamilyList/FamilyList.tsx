import { families } from "../../../data/families";
import { COURT_ORDER, getCourtDetails } from "../../../utils/court";
import { FamilyCrest } from "../FamilyCrest/FamilyCrest";
import "./FamilyList.css";

export function FamilyList() {
  return (
    <div className="family-list">
      {COURT_ORDER.map((courtId) => {
        const courtFamilies = families.filter((family) => family.court === courtId);
        if (!courtFamilies.length) return null;
        return (
          <section className="court-group" key={courtId} style={{ "--court-accent": getCourtDetails(courtId).color } as React.CSSProperties}>
            <div className="court-group__heading"><span /> <h3>Corte {getCourtDetails(courtId).name}</h3> <span /></div>
            <div className="court-group__families">{courtFamilies.map((family) => <FamilyCrest family={family} key={family.id} />)}</div>
          </section>
        );
      })}
    </div>
  );
}
